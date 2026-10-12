export const Category = {
  FrutaFresca: "Frutas frescas",
  VerduraOrganica: "Verdura orgánica",
  ProductoOrganico: "Producto orgánico",
  ProductoLacteo: "Producto lácteo",
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export const CATEGORIES: Category[] = Object.values(Category);

/** Prefijo de los códigos de producto de cada categoría (FR001, VR002…) */
const CATEGORY_PREFIX: Record<Category, string> = {
  [Category.FrutaFresca]: "FR",
  [Category.VerduraOrganica]: "VR",
  [Category.ProductoOrganico]: "PO",
  [Category.ProductoLacteo]: "PL",
};

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

export function getFinalPrice(
  product: Pick<Product, "price" | "discount">,
): number {
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

export function toCategorySlug(category: Category): string {
  return slugify(category);
}

export function findCategory(value: string): Category | undefined {
  const slug = slugify(value);

  return CATEGORIES.find((category) => slugify(category) === slug);
}

export function nextProductId(
  category: Category,
  products: Pick<Product, "id">[],
): string {
  const prefix = CATEGORY_PREFIX[category];

  const last = products
    .filter(({ id }) => id.startsWith(prefix))
    .map(({ id }) => Number(id.slice(prefix.length)))
    .filter(Number.isInteger)
    .reduce((max, n) => Math.max(max, n), 0);

  return prefix + String(last + 1).padStart(3, "0");
}
