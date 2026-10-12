import { Link } from "react-router";
import {
  getFinalPrice,
  getProductImage,
  priceFormat,
  type Product,
} from "@huerto/shared";
import styles from "./ProductRow.module.css";

interface ProductRowProps {
  product: Product;
  onDelete: () => void;
}

export default function ProductRow({ product, onDelete }: ProductRowProps) {
  return (
    <tr>
      <td>
        <img
          className={styles.image}
          src={getProductImage(product)}
          alt=""
          loading="lazy"
        />
      </td>
      <td className={styles.code}>{product.id}</td>
      <td>
        <Link to={`/product/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
      </td>
      <td>{product.category}</td>
      <td>
        {product.discount ? (
          <>
            <span className={styles.oldPrice}>
              {priceFormat.format(product.price)}
            </span>{" "}
            {priceFormat.format(getFinalPrice(product))}
          </>
        ) : (
          priceFormat.format(product.price)
        )}
      </td>
      <td>{product.discount ? `${product.discount}%` : "—"}</td>
      <td className={product.stock === 0 ? styles.outOfStock : undefined}>
        {product.stock}
      </td>
      <td>
        <div className={styles.actions}>
          <Link to={`/admin/products/${product.id}`} className={styles.edit}>
            Editar
          </Link>
          <button type="button" className={styles.remove} onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}
