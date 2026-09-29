import type { LoaderFunctionArgs } from "react-router";
import { getProduct } from "@huerto/shared";

export async function productLoader({ params }: LoaderFunctionArgs) {
  const product = params.productId
    ? await getProduct(params.productId)
    : undefined;

  return { product };
}

export type ProductData = Awaited<ReturnType<typeof productLoader>>;
