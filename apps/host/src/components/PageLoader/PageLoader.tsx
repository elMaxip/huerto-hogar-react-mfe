import styles from "./PageLoader.module.css";

export default function PageLoader() {
  return (
    <p className={styles.loader} role="status">
      Cargando…
    </p>
  );
}
