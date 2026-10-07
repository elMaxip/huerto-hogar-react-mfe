import { getCart, getProducts, setQuantity } from "@huerto/shared";

export async function cartLoader() {
  const products = await getProducts();

  for (const item of getCart()) {
    const product = products.find(({ id }) => id === item.productId);

    if (product && item.quantity > product.stock) {
      setQuantity(item.productId, product.stock);
    }
  }

  return { products };
}

export type CartData = Awaited<ReturnType<typeof cartLoader>>;
