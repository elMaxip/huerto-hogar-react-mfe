import type { LoaderFunctionArgs } from "react-router";
import { findCategory, getProducts, getProductsByCategory } from "@huerto/shared";

export async function catalogLoader({ params }: LoaderFunctionArgs) {
  const slug = params.category;
  const category = slug ? findCategory(slug) : undefined;

  const products = category
    ? await getProductsByCategory(category)
    : slug
      ? []
      : await getProducts();

  return { slug, category, products };
}

export type CatalogData = Awaited<ReturnType<typeof catalogLoader>>;
