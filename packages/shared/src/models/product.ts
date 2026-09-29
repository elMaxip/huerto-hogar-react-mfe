export const Category = {
  FrutaFresca: "Frutas frescas",
  VerduraOrganica: "Verdura orgánica",
  ProductoOrganico: "Producto orgánico",
  ProductoLacteo: "Producto lácteo",
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export const CATEGORIES: Category[] = Object.values(Category);

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  discount?: number;
  unidadVenta: string;
  img: string;
  stock: number;
  description: string;
}

export const priceFormat = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

/** Precio que se cobra: aplica el descuento cuando el producto tiene uno */
export function getFinalPrice(product: Pick<Product, "price" | "discount">): number {
  if (!product.discount) return product.price;

  return Math.trunc((product.price * (100 - product.discount)) / 100);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/** "Verdura orgánica" -> "verdura-organica", para poder usarla en la URL */
export function toCategorySlug(category: Category): string {
  return slugify(category);
}

/** Acepta el slug de la URL o el nombre tal cual de la categoría */
export function findCategory(value: string): Category | undefined {
  const slug = slugify(value);

  return CATEGORIES.find((category) => slugify(category) === slug);
}
