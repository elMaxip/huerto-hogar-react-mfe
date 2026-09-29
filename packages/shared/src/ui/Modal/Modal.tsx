import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Nombre accesible del diálogo */
  label: string;
  /** Clases extra para posicionar el panel */
  className?: string;
  children: ReactNode;
}

/**
 * Se renderiza con un portal directo en <body>: así escapa del overflow,
 * z-index y posición de quien lo abre (por ejemplo la navbar).
 */
export function Modal({ open, onClose, label, className, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(event) => {
        // Solo cierra si el click fue fuera del panel
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={[styles.panel, className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
