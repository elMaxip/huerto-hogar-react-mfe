import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav>
      <div id={styles.left}>
        <a href="/">Inicio</a>
        <a href="/catalog">Catálogo</a>
        <a href="/blog">Blog</a>
        <a href="/about">Nosotros</a>
      </div>

      <h1>HuertoHogar</h1>

      <div id={styles.right}>
        <a href="/cart">
          Carrito<span id={styles["cart-count"]} hidden></span>
        </a>
        <button id={styles.account}>Cuenta</button>
      </div>
    </nav>
  );
}
