import type { User } from "../../models/user";
import { DEFAULT_ADMIN, INITIAL_PRODUCTS } from "./seed";

const DB_NAME = "huertohogar-react";
const DB_VERSION = 2;

let connection: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  connection ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = req.result;

      if (!db.objectStoreNames.contains("users")) {
        const objectStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });

        objectStore.createIndex("email_idx", "email", { unique: true });
      }

      if (!db.objectStoreNames.contains("products")) {
        const objectStore = db.createObjectStore("products", {
          keyPath: "id",
        });

        objectStore.createIndex("category_idx", "category");

        for (const product of INITIAL_PRODUCTS) {
          objectStore.add(product);
        }
      }

      // Hoy siempre se cumple (DB_VERSION es 2); queda para que una futura
      // versión 3 no vuelva a crear el administrador al migrar desde la 2
      /* v8 ignore else -- @preserve */
      if (event.oldVersion < 2) {
        seedAdmin(req.transaction!.objectStore("users"));
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      connection = null;
      reject(req.error);
    };
  });

  return connection;
}

/**
 * Crea la cuenta de administrador por defecto. Si alguien ya se registró con
 * ese correo, la cuenta se sobrescribe para que no quede con el rol de admin
 * y una contraseña elegida por otra persona.
 */
function seedAdmin(users: IDBObjectStore) {
  const existing = users.index("email_idx").get(DEFAULT_ADMIN.email);

  existing.onsuccess = () => {
    const user = existing.result as User | undefined;

    users.put(user ? { ...DEFAULT_ADMIN, id: user.id } : DEFAULT_ADMIN);
  };
}

export function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
