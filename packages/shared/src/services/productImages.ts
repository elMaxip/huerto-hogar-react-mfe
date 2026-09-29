import type { Product } from "../models/product";

/**
 * En la base de datos se guarda solo el nombre del archivo ("manzanas-fuji.webp").
 * La URL real depende de qué app y qué build la sirve (dev, preview, producción),
 * así que se resuelve al renderizar y nunca queda una URL vieja guardada.
 */
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

  // Si no es uno de nuestros archivos, se asume que ya es una URL
  return IMAGES[product.img] ?? product.img;
}
