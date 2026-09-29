import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import NotFound from "../NotFound/NotFound";
import styles from "../page.module.css";

/**
 * ErrorBoundary de las rutas: atrapa los errores de los loaders y también
 * los de `lazy` cuando un micro-frontend no responde.
 */
export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  console.error(error);

  return (
    <section className={styles.page}>
      <title>Algo salió mal</title>
      <h1 className={styles.title}>Algo salió mal</h1>
      <p>
        No pudimos cargar esta sección. Puede que el servicio no esté
        disponible en este momento, intenta nuevamente en unos minutos.
      </p>
      <Link to="/" className={styles.link} reloadDocument>
        Volver al inicio
      </Link>
    </section>
  );
}
