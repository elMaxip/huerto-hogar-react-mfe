import type { Product } from "../models/product";

const IMAGES = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/products/*.webp", {
      eager: true,
      import: "default",
    }),
  ).map(([path, url]) => [path.split("/").pop()!, url]),
);

const FALLBACK_IMG = IMAGES["manzanas-fuji.webp"];

export function getProductImage(product: Pick<Product, "img">): string {
  if (!product.img) return FALLBACK_IMG;
  return IMAGES[product.img] ?? product.img;
}
