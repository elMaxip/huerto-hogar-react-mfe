import { beforeEach, describe, expect, it, vi } from "vitest";
import { Category, type Product } from "../../models/product";
import { createFakeDatabase } from "../../test/fakeDatabase";
import { openDatabase } from "./db";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getProductsByCategory,
  updateProduct,
} from "./product";

vi.mock(import("./db"), async (importOriginal) => ({
  ...(await importOriginal()),
  openDatabase: vi.fn(),
}));

const manzanas: Product = {
  id: "FR001",
  name: "Manzanas Fuji",
  category: Category.FrutaFresca,
  price: 1200,
  discount: 20,
  unidadVenta: "por kilo",
  img: "manzanas-fuji.webp",
  stock: 150,
  description: "Manzanas crujientes",
};

const miel: Product = {
  ...manzanas,
  id: "PO001",
  name: "Miel Orgánica",
  category: Category.ProductoOrganico,
  discount: undefined,
};

beforeEach(async () => {
  vi.mocked(openDatabase).mockResolvedValue(createFakeDatabase());

  await createProduct(manzanas);
  await createProduct(miel);
});

describe("servicio de productos", () => {
  it("lista todos los productos", async () => {
    await expect(getProducts()).resolves.toEqual([manzanas, miel]);
  });

  it("obtiene un producto por su código", async () => {
    await expect(getProduct("PO001")).resolves.toEqual(miel);
    await expect(getProduct("XX999")).resolves.toBeUndefined();
  });

  it("filtra los productos por categoría", async () => {
    await expect(
      getProductsByCategory(Category.ProductoOrganico),
    ).resolves.toEqual([miel]);
    await expect(
      getProductsByCategory(Category.ProductoLacteo),
    ).resolves.toEqual([]);
  });

  it("no permite crear dos productos con el mismo código", async () => {
    await expect(createProduct(manzanas)).rejects.toThrow();
  });

  it("actualiza un producto", async () => {
    await updateProduct({ ...manzanas, stock: 3 });

    await expect(getProduct("FR001")).resolves.toMatchObject({ stock: 3 });
  });

  it("elimina un producto", async () => {
    await deleteProduct("FR001");

    await expect(getProducts()).resolves.toEqual([miel]);
  });
});
