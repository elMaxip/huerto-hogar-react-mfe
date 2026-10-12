import { Navigate, NavLink, Outlet, useLocation } from "react-router";
import { isAdmin, useSession } from "@huerto/shared";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  const session = useSession();
  const { pathname } = useLocation();

  if (!session) {
    return (
      <Navigate
        to={`/login?redirectTo=${encodeURIComponent(pathname)}`}
        replace
      />
    );
  }

  if (!isAdmin(session)) return <Navigate to="/" replace />;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Panel de administración</p>
          <h1 className={styles.title}>Productos</h1>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/admin" end className={styles.link}>
            Listado
          </NavLink>
          <NavLink to="/admin/products/new" className={styles.link}>
            Nuevo producto
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </section>
  );
}
