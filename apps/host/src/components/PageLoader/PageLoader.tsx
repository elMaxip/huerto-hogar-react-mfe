import styles from "./PageLoader.module.css";

/** Se muestra en la primera carga, mientras llega el remoto de la ruta */
export default function PageLoader() {
  return (
    <p className={styles.loader} role="status">
      Cargando…
    </p>
  );
}
