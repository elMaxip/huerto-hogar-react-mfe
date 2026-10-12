import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import NotFound from "../NotFound/NotFound";
import styles from "../page.module.css";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  if (isRouteErrorResponse(error) && error.status === 403) {
    return (
      <section className={styles.page}>
        <title>Acceso denegado</title>
        <h1 className={styles.title}>Acceso denegado</h1>
        <p>
          Esta sección es solo para administradores. Inicia sesión con una
          cuenta de administrador para continuar.
        </p>
        <Link to="/" className={styles.link}>
          Volver al inicio
        </Link>
      </section>
    );
  }

  console.error(error);

  return (
    <section className={styles.page}>
      <title>Algo salió mal</title>
      <h1 className={styles.title}>Algo salió mal</h1>
      <p>
        No pudimos cargar esta sección. Puede que el servicio no esté disponible
        en este momento, intenta nuevamente en unos minutos.
      </p>
      <Link to="/" className={styles.link} reloadDocument>
        Volver al inicio
      </Link>
    </section>
  );
}
