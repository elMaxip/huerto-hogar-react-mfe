import { useLoaderData } from "react-router";
import { CATEGORIES, Category } from "@huerto/shared";
import ProductCard from "../../components/ProductCard/ProductCard";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import type { HomeData } from "./loader";
import styles from "./Home.module.css";

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  [Category.FrutaFresca]: "Cosechadas en su punto justo, dulces y jugosas.",
  [Category.VerduraOrganica]: "Cultivadas sin pesticidas por productores locales.",
  [Category.ProductoOrganico]: "Despensa natural, sin aditivos ni conservantes.",
  [Category.ProductoLacteo]: "Frescura del campo directo a tu mesa.",
};

export default function Home() {
  const { products } = useLoaderData<HomeData>();

  const promotions = products.filter((product) => product.discount);
  const featured = products.filter((product) => !product.discount);

  return (
    <section>
      <title>Inicio</title>

      <article className={styles.row}>
        <h2 className={styles.heading}>Promociones</h2>
        <div className={styles.cards}>
          {promotions.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </article>

      <article className={styles.row}>
        <h2 className={styles.heading}>Productos destacados</h2>
        <div className={styles.cards}>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </article>

      <article className={styles.row}>
        <h2 className={styles.heading}>Categorías</h2>
        <div className={styles.cards}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              description={CATEGORY_DESCRIPTIONS[category]}
            />
          ))}
        </div>
      </article>
    </section>
  );
}
