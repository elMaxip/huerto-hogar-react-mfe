import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ADMIN, INITIAL_PRODUCTS } from "./seed";

const DB_NAME = "huertohogar-react";

/** `db.ts` guarda la conexión en el módulo: se importa de nuevo en cada prueba */
async function loadDb() {
  vi.resetModules();
  return import("./db");
}

function readAll(db: IDBDatabase, store: string) {
  return new Promise<unknown[]>((resolve) => {
    const req = db.transaction(store).objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

/** Crea la base como estaba en la versión 1, antes de existir los roles */
function createVersion1(users: Record<string, unknown>[]) {
  return new Promise<void>((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      const userStore = db.createObjectStore("users", {
        keyPath: "id",
        autoIncrement: true,
      });
      userStore.createIndex("email_idx", "email", { unique: true });
      db.createObjectStore("products", { keyPath: "id" }).createIndex(
        "category_idx",
        "category",
      );

      for (const user of users) userStore.add(user);
    };

    req.onsuccess = () => {
      req.result.close();
      resolve();
    };
  });
}

beforeEach(() => {
  vi.stubGlobal("indexedDB", new IDBFactory());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("openDatabase", () => {
  it("crea la base con los productos iniciales y el administrador", async () => {
    const { openDatabase } = await loadDb();

    const db = await openDatabase();

    expect(db.version).toBe(2);
    expect([...db.objectStoreNames].sort()).toEqual(["products", "users"]);
    expect(await readAll(db, "products")).toEqual(
      [...INITIAL_PRODUCTS].sort((a, b) => a.id.localeCompare(b.id)),
    );
    expect(await readAll(db, "users")).toEqual([{ ...DEFAULT_ADMIN, id: 1 }]);
  });

  it("reutiliza la misma conexión", async () => {
    const { openDatabase } = await loadDb();
    const open = vi.spyOn(indexedDB, "open");

    const first = await openDatabase();
    const second = await openDatabase();

    expect(second).toBe(first);
    expect(open).toHaveBeenCalledOnce();
  });

  it("al migrar desde la versión 1 conserva los datos y crea el administrador", async () => {
    await createVersion1([
      { fullname: "Ana", email: "ana@correo.cl", password: "secreta123" },
    ]);
    const { openDatabase } = await loadDb();

    const db = await openDatabase();

    // Los almacenes ya existían: no se vuelven a cargar los productos
    expect(await readAll(db, "products")).toEqual([]);
    expect(await readAll(db, "users")).toEqual([
      { id: 1, fullname: "Ana", email: "ana@correo.cl", password: "secreta123" },
      { ...DEFAULT_ADMIN, id: 2 },
    ]);
  });

  it("sobrescribe una cuenta registrada antes con el correo del administrador", async () => {
    await createVersion1([
      { fullname: "Ana", email: "ana@correo.cl", password: "secreta123" },
      { fullname: "Intruso", email: DEFAULT_ADMIN.email, password: "otra-clave" },
    ]);
    const { openDatabase } = await loadDb();

    const db = await openDatabase();

    expect(await readAll(db, "users")).toEqual([
      { id: 1, fullname: "Ana", email: "ana@correo.cl", password: "secreta123" },
      { ...DEFAULT_ADMIN, id: 2 },
    ]);
  });

  it("si no se puede abrir, falla y permite reintentar", async () => {
    // Una base con una versión mayor no se puede abrir con la versión 2
    await new Promise<void>((resolve) => {
      const req = indexedDB.open(DB_NAME, 3);
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
    });
    const { openDatabase } = await loadDb();
    const open = vi.spyOn(indexedDB, "open");

    await expect(openDatabase()).rejects.toMatchObject({ name: "VersionError" });
    await expect(openDatabase()).rejects.toMatchObject({ name: "VersionError" });

    // La conexión fallida no se guarda: cada llamada vuelve a intentarlo
    expect(open).toHaveBeenCalledTimes(2);
  });
});

describe("request", () => {
  it("resuelve con el resultado y rechaza con el error de IndexedDB", async () => {
    const { openDatabase, request } = await loadDb();
    const db = await openDatabase();
    const products = () =>
      db.transaction("products", "readwrite").objectStore("products");

    await expect(request(products().get("FR001"))).resolves.toMatchObject({
      name: "Manzanas Fuji",
    });
    await expect(
      request(products().add(INITIAL_PRODUCTS[0])),
    ).rejects.toMatchObject({ name: "ConstraintError" });
  });
});
