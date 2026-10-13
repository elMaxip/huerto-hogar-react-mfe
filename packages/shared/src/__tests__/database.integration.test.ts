import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Servicios de productos, usuarios y sesión contra un IndexedDB real en
 * memoria (fake-indexeddb), sin reemplazar ninguna función de la base.
 */
async function loadShared() {
  // La conexión se guarda en el módulo: cada prueba parte con una base nueva
  vi.resetModules();
  return import("..");
}

beforeEach(() => {
  vi.stubGlobal("indexedDB", new IDBFactory());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("base de datos de la tienda", () => {
  it("registra un cliente, lo busca e inicia su sesión", async () => {
    const shared = await loadShared();

    const ana = await shared.register({
      fullname: "Ana Pérez",
      email: "ana@correo.cl",
      password: "secreta123",
      role: shared.Role.Client,
    });

    const found = await shared.getUser("ana@correo.cl");
    expect(found).toEqual(ana);
    await expect(shared.getUserById(ana.id)).resolves.toEqual(ana);

    shared.login(found!);
    expect(shared.getSession()).toMatchObject({ email: "ana@correo.cl" });
    expect(shared.isAdmin(shared.getSession())).toBe(false);
  });

  it("no permite dos cuentas con el mismo correo", async () => {
    const shared = await loadShared();

    await expect(
      shared.register({
        fullname: "Otro",
        email: "admin@huertohogar.cl",
        password: "12345678",
        role: shared.Role.Client,
      }),
    ).rejects.toMatchObject({ name: "ConstraintError" });
  });

  it("la cuenta de administrador por defecto tiene el rol de admin", async () => {
    const shared = await loadShared();

    const admin = await shared.getUser("admin@huertohogar.cl");

    expect(shared.isAdmin(admin)).toBe(true);
  });

  it("crea, edita, filtra y elimina productos", async () => {
    const shared = await loadShared();
    const products = await shared.getProducts();
    const id = shared.nextProductId(shared.Category.ProductoLacteo, products);

    await shared.createProduct({
      id,
      name: "Leche Entera",
      category: shared.Category.ProductoLacteo,
      price: 1100,
      unidadVenta: "por litro",
      img: "",
      stock: 40,
      description: "Leche entera de libre pastoreo.",
    });

    expect(id).toBe("PL001");
    await expect(
      shared.getProductsByCategory(shared.Category.ProductoLacteo),
    ).resolves.toMatchObject([{ id: "PL001", name: "Leche Entera" }]);

    const leche = (await shared.getProduct("PL001"))!;
    await shared.updateProduct({ ...leche, stock: 0, discount: 15 });
    await expect(shared.getProduct("PL001")).resolves.toMatchObject({
      stock: 0,
      discount: 15,
    });
    expect(shared.getFinalPrice({ ...leche, discount: 15 })).toBe(935);

    await shared.deleteProduct("PL001");
    await expect(shared.getProduct("PL001")).resolves.toBeUndefined();
    await expect(shared.getProducts()).resolves.toHaveLength(products.length);
  });

  it("no permite crear dos productos con el mismo código", async () => {
    const shared = await loadShared();
    const [first] = await shared.getProducts();

    await expect(shared.createProduct(first)).rejects.toMatchObject({
      name: "ConstraintError",
    });
  });
});
