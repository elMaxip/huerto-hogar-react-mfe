import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { deleteProduct, getProducts } from "@huerto/shared";
import { requireAdmin } from "../../auth";

export async function productsLoader(args: LoaderFunctionArgs) {
  await requireAdmin(args);

  const products = await getProducts();

  return { products };
}

export async function productsAction(args: ActionFunctionArgs) {
  await requireAdmin(args);

  const formData = await args.request.formData();
  const productId = formData.get("productId");

  if (formData.get("intent") === "delete" && typeof productId === "string") {
    await deleteProduct(productId);
  }

  return null;
}

export type ProductsData = Awaited<ReturnType<typeof productsLoader>>;
