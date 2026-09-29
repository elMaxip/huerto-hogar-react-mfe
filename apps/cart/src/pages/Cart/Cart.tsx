import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { clearCart, getFinalPrice, priceFormat, useCart } from "@huerto/shared";
import { PrimaryButton } from "@huerto/shared/ui";
import CartItemRow from "../../components/CartItemRow/CartItemRow";
import type { CartData } from "./loader";
import styles from "./Cart.module.css";

export default function Cart() {
  const { products } = useLoaderData<CartData>();
  const cart = useCart();
  const [message, setMessage] = useState<string | null>(null);

  const productsById = new Map(products.map((product) => [product.id, product]));

  // Un producto puede haber desaparecido de la base de datos
  const items = cart.flatMap((item) => {
    const product = productsById.get(item.productId);

    return product ? [{ product, quantity: item.quantity }] : [];
  });

  const total = items.reduce(
    (sum, { product, quantity }) => sum + getFinalPrice(product) * quantity,
    0,
  );

  function handleClear() {
    clearCart();
    setMessage(null);
  }

  function handleBuy() {
    if (items.length === 0) return;

    clearCart();
    setMessage("¡Gracias por tu compra! Tu carrito quedó vacío.");
  }

  return (
    <section className={styles.page}>
      <title>Carrito de compras</title>

      <header className={styles.header}>
        <h1 className={styles.title}>Carrito de compras</h1>
        {items.length > 0 && (
          <button type="button" className={styles.clear} onClick={handleClear}>
            Eliminar carrito
          </button>
        )}
      </header>

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>
          Tu carrito está vacío. <Link to="/">Ver productos</Link>
        </p>
      ) : (
        <>
          <ul className={styles.items}>
            {items.map(({ product, quantity }) => (
              <CartItemRow
                key={product.id}
                product={product}
                quantity={quantity}
              />
            ))}
          </ul>

          <footer className={styles.summary}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <strong className={styles.total}>
                {priceFormat.format(total)}
              </strong>
            </div>
            <PrimaryButton onClick={handleBuy}>Comprar productos</PrimaryButton>
          </footer>
        </>
      )}
    </section>
  );
}
