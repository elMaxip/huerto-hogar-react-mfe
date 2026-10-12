import { Link } from "react-router";
import { isAdmin, logout, useSession } from "@huerto/shared";
import { PrimaryButton } from "@huerto/shared/ui";
import styles from "./SessionCard.module.css";

export default function SessionCard() {
  const user = useSession();

  if (!user) {
    return (
      <section className={styles.card}>
        <Link to="/login" className={styles.action}>
          Iniciar sesión
        </Link>
        <Link to="/register" className={styles.action}>
          Registrar cuenta
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <span className={styles.fullname}>{user.fullname}</span>
      <span>{user.email}</span>
      {isAdmin(user) && (
        <Link to="/admin" className={styles.action}>
          Panel de administración
        </Link>
      )}
      <PrimaryButton onClick={logout}>Cerrar sesión</PrimaryButton>
    </section>
  );
}
