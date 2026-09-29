import type { Category, Product } from "../../models/product";
import { openDatabase, request } from "./db";

async function productStore() {
  const db = await openDatabase();

  return db.transaction("products", "readonly").objectStore("products");
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
