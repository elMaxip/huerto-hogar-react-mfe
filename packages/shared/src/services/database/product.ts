import type { Category, Product } from "../../models/product";
import { openDatabase, request } from "./db";

async function productStore(mode: IDBTransactionMode = "readonly") {
  const db = await openDatabase();

  return db.transaction("products", mode).objectStore("products");
}

export async function getProducts(): Promise<Product[]> {
  const store = await productStore();

  return request<Product[]>(store.getAll());
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const store = await productStore();

  return request<Product | undefined>(store.get(id));
}

export async function getProductsByCategory(
  category: Category,
): Promise<Product[]> {
  const store = await productStore();

  return request<Product[]>(store.index("category_idx").getAll(category));
}

/** Falla si ya existe un producto con el mismo id */
export async function createProduct(product: Product): Promise<void> {
  const store = await productStore("readwrite");

  await request(store.add(product));
}

export async function updateProduct(product: Product): Promise<void> {
  const store = await productStore("readwrite");

  await request(store.put(product));
}

export async function deleteProduct(id: string): Promise<void> {
  const store = await productStore("readwrite");

  await request(store.delete(id));
}
