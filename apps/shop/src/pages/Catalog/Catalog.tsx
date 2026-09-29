import { NavLink, useLoaderData } from "react-router";
import { CATEGORIES, toCategorySlug } from "@huerto/shared";
import ProductCard from "../../components/ProductCard/ProductCard";
import type { CatalogData } from "./loader";
import styles from "./Catalog.module.css";

const FILTERS = [
  { label: "Todas", to: "/catalog" },
  ...CATEGORIES.map((category) => ({
    label: category,
    to: `/catalog/${toCategorySlug(category)}`,
  })),
];

export default function Catalog() {
  const { slug, category, products } = useLoaderData<CatalogData>();

  const subtitle = category
    ? "Productos de esta categoría"
    : slug
      ? `No existe la categoría "${slug}"`
      : "Todos nuestros productos";

  return (
    <section className={styles.page}>
      <title>{category ?? "Catálogo"}</title>

      <header>
        <h1 className={styles.title}>{category ?? "Catálogo"}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      <nav className={styles.filters} aria-label="Filtrar por categoría">
        {FILTERS.map((filter) => (
          // `end` evita que "Todas" quede activa dentro de /catalog/:category
          <NavLink key={filter.to} to={filter.to} end className={styles.filter}>
            {filter.label}
          </NavLink>
        ))}
      </nav>

      {products.length > 0 ? (
        <div className={styles.products}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>No hay productos en esta categoría.</p>
      )}
    </section>
  );
}
