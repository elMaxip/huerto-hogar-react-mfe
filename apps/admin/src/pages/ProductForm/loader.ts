import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import {
  createProduct,
  getProduct,
  getProducts,
  nextProductId,
  updateProduct,
} from "@huerto/shared";
import { requireAdmin } from "../../auth";
import { productPayloadSchema } from "./schema";

export async function productFormLoader(args: LoaderFunctionArgs) {
  await requireAdmin(args);

  const { productId } = args.params;

  if (!productId) return { product: undefined };

  const product = await getProduct(productId);

  if (!product) throw data("Producto no encontrado", { status: 404 });

  return { product };
}

export async function productFormAction(args: ActionFunctionArgs) {
  await requireAdmin(args);

  const result = productPayloadSchema.safeParse(await args.request.json());

  if (!result.success) {
    return { error: "Los datos del producto no son válidos" };
  }

  const { discount, ...fields } = result.data;
  const values = { ...fields, discount: discount || undefined };
  const { productId } = args.params;

  if (productId && !(await getProduct(productId))) {
    throw data("Producto no encontrado", { status: 404 });
  }

  try {
    if (productId) {
      await updateProduct({ ...values, id: productId });
    } else {
      const id = nextProductId(values.category, await getProducts());

      await createProduct({ ...values, id });
    }
  } catch {
    return { error: "No se pudo guardar el producto, intenta nuevamente" };
  }

  return redirect("/admin");
}

export type ProductFormData = Awaited<ReturnType<typeof productFormLoader>>;
/** Sin la redirección: lo que puede llegar a `useActionData` */
export type ProductFormActionData = Exclude<
  Awaited<ReturnType<typeof productFormAction>>,
  Response
>;
