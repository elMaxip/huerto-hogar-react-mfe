import { getProducts } from "@huerto/shared";

export async function homeLoader() {
  return { products: await getProducts() };
}

export type HomeData = Awaited<ReturnType<typeof homeLoader>>;
