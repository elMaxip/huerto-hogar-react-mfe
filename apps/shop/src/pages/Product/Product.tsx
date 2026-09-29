import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import {
  addToCart,
  getProductImage,
  getFinalPrice,
  priceFormat,
} from "@huerto/shared";
import { PrimaryButton } from "@huerto/shared/ui";
import type { ProductData } from "./loader";
import styles from "./Product.module.css";

export default function Product() {
  const { product } = useLoaderData<ProductData>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState("1");

  if (!product) {
    return (
      <section className={styles.page}>
        <title>Producto no encontrado</title>
        <p>
          No encontramos este producto.{" "}
          <Link to="/" className={styles.inlineLink}>
            Volver al inicio
          </Link>
        </p>
      </section>
    );
  }

  const inStock = product.stock > 0;
  const hasDiscount = Boolean(product.discount);

  function handleAdd() {
    if (!product || !inStock) return;

    const amount = Math.min(
      Math.max(Math.trunc(Number(quantity)) || 1, 1),
      product.stock,
    );

    addToCart(product.id, amount);
    navigate("/cart");
  }

  return (
    <section className={styles.page}>
      <title>{product.name}</title>

      <Link to="/" className={styles.back}>
        ← Volver a la tienda
      </Link>

      <article className={styles.detail}>
        <div className={styles.imageContainer}>
          {hasDiscount && (
            <span className={styles.badge}>{product.discount}% OFF</span>
          )}
          <img src={getProductImage(product)} alt={product.name} />
        </div>

        <div className={styles.info}>
          <span className={styles.muted}>{product.category}</span>
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.prices} data-discount={hasDiscount}>
            <span className={styles.price}>
              {priceFormat.format(product.price)}
            </span>
            {hasDiscount && (
              <span className={styles.discountPrice}>
                {priceFormat.format(getFinalPrice(product))}
              </span>
            )}
            <span className={styles.muted}>{product.unidadVenta}</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          <span className={inStock ? styles.stock : styles.outOfStock}>
            {inStock ? `${product.stock} unidades disponibles` : "Sin stock"}
          </span>

          <div className={styles.actions}>
            <label className={styles.quantityLabel}>
              Cantidad
              <input
                className={styles.quantity}
                type="number"
                min={1}
                max={product.stock}
                step={1}
                value={quantity}
                disabled={!inStock}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <PrimaryButton onClick={handleAdd} disabled={!inStock}>
              Añadir al carrito de compras
            </PrimaryButton>
          </div>
        </div>
      </article>
    </section>
  );
}
