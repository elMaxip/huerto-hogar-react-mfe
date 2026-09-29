import { Link } from "react-router";
import {
  getProductImage,
  getFinalPrice,
  priceFormat,
  type Product,
} from "@huerto/shared";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = Boolean(product.discount);

  return (
    <Link
      to={`/product/${encodeURIComponent(product.id)}`}
      className={styles.card}
      data-discount={hasDiscount}
    >
      <article className={styles.article}>
        <div className={styles.imageContainer}>
          {hasDiscount && (
            <span className={styles.badge}>{product.discount}% OFF</span>
          )}
          <img
            className={styles.image}
            src={getProductImage(product)}
            alt={product.name}
          />
        </div>

        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h3 className={styles.name}>{product.name}</h3>

          <div className={styles.prices}>
            <span className={styles.price}>
              {priceFormat.format(product.price)}
            </span>
            {hasDiscount && (
              <span className={styles.discountPrice}>
                {priceFormat.format(getFinalPrice(product))}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
