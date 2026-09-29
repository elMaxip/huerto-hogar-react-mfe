import { lazy, Suspense, useState } from "react";
import { useLocation } from "react-router";
import { Modal } from "@huerto/shared/ui";
import RemoteBoundary from "../RemoteBoundary/RemoteBoundary";
import styles from "./SessionMenu.module.css";

// La tarjeta de sesión es del micro-frontend de autenticación
const SessionCard = lazy(() => import("auth/SessionCard"));

export default function SessionMenu() {
  const { pathname } = useLocation();

  // Guardamos en qué ruta se abrió: al navegar a otra, el modal queda cerrado solo
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpenedAt(pathname)}
      >
        Cuenta
      </button>

      <Modal
        open={open}
        onClose={() => setOpenedAt(null)}
        label="Cuenta"
        className={styles.panel}
      >
        <RemoteBoundary fallback={<p className={styles.status}>No se pudo cargar la cuenta.</p>}>
          <Suspense fallback={<p className={styles.status}>Cargando…</p>}>
            <SessionCard />
          </Suspense>
        </RemoteBoundary>
      </Modal>
    </>
  );
}
