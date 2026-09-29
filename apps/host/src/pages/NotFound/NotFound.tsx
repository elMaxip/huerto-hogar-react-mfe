import { Link, useLocation } from "react-router";
import styles from "../page.module.css";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <section className={styles.page}>
      <title>Página no encontrada</title>
      <h1 className={styles.title}>404</h1>
      <p>No existe la página {pathname}</p>
      <Link to="/" className={styles.link}>
        Volver al inicio
      </Link>
    </section>
  );
}
