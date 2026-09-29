import { useState } from "react";
import { Link } from "react-router";
import {
  getProductImage,
  getFinalPrice,
  priceFormat,
  removeFromCart,
  setQuantity,
  type Product,
} from "@huerto/shared";
import styles from "./CartItemRow.module.css";

interface CartItemRowProps {
  product: Product;
  quantity: number;
}

export default function CartItemRow({ product, quantity }: CartItemRowProps) {
  // Lo que escribe el usuario: puede quedar vacío mientras edita
  const [draft, setDraft] = useState(String(quantity));

  const unitPrice = getFinalPrice(product);
  const productUrl = `/product/${encodeURIComponent(product.id)}`;

  function handleChange(value: string) {
    const requested = Math.trunc(Number(value));

    if (!value || !requested || requested < 1) {
      setDraft(value);
      return;
    }

    const clamped = Math.min(requested, product.stock);

    setDraft(String(clamped));
    setQuantity(product.id, clamped);
  }

  function handleBlur() {
    const requested = Math.trunc(Number(draft));

    // Bajar de 1 equivale a sacar el producto del carrito
    if (!requested || requested < 1) removeFromCart(product.id);
  }

  return (
    <li className={styles.item}>
      <Link to={productUrl} className={styles.imageLink}>
        <img src={getProductImage(product)} alt={product.name} />
      </Link>

      <div className={styles.info}>
        <Link to={productUrl} className={styles.name}>
          {product.name}
        </Link>
        <span className={styles.muted}>{product.category}</span>
        <span className={styles.muted}>
          {priceFormat.format(unitPrice)} {product.unidadVenta}
        </span>
      </div>

      <label className={styles.quantityLabel}>
        Cantidad
        <input
          className={styles.quantity}
          type="number"
          min={1}
          max={product.stock}
          step={1}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
        />
      </label>

      <span className={styles.subtotal}>
        {priceFormat.format(unitPrice * quantity)}
      </span>

      <button
        type="button"
        className={styles.remove}
        onClick={() => removeFromCart(product.id)}
      >
        Eliminar
      </button>
    </li>
  );
}
