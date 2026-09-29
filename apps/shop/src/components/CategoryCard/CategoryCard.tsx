import { Link } from "react-router";
import { Category, toCategorySlug } from "@huerto/shared";
import frutasFrescas from "../../assets/categories/frutas-frescas.webp";
import verduraOrganica from "../../assets/categories/verdura-organica.webp";
import productoOrganico from "../../assets/categories/producto-organico.webp";
import productoLacteo from "../../assets/categories/producto-lacteo.webp";
import styles from "./CategoryCard.module.css";

const IMAGES: Record<Category, string> = {
  [Category.FrutaFresca]: frutasFrescas,
  [Category.VerduraOrganica]: verduraOrganica,
  [Category.ProductoOrganico]: productoOrganico,
  [Category.ProductoLacteo]: productoLacteo,
};

interface CategoryCardProps {
  category: Category;
  description: string;
}

export default function CategoryCard({ category, description }: CategoryCardProps) {
  return (
    // El catálogo filtra por el slug de la categoría
    <Link to={`/catalog/${toCategorySlug(category)}`} className={styles.card}>
      <article className={styles.article}>
        <div className={styles.left}>
          <div className={styles.top}>
            <h3 className={styles.title}>{category}</h3>
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </div>
          <span className={styles.cta}>Ver productos</span>
        </div>
        <div className={styles.right}>
          <img className={styles.image} src={IMAGES[category]} alt="" />
        </div>
      </article>
    </Link>
  );
}
