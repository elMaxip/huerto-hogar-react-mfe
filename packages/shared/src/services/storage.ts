/**
 * Cada micro-frontend trae su propia copia de este código, así que el estado
 * compartido vive en localStorage y los cambios se avisan con un evento en window.
 * Así el carrito del remoto "cart" y el contador de la navbar del host se enteran
 * de lo mismo sin conocerse entre sí.
 */
export function createStorageChannel(key: string, eventName: string) {
  return {
    read(): string | null {
      return localStorage.getItem(key);
    },

    write(value: string | null) {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }

      window.dispatchEvent(new CustomEvent(eventName));
    },

    /** Firma compatible con useSyncExternalStore */
    subscribe(callback: () => void) {
      // "storage" llega cuando el cambio viene de otra pestaña
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) callback();
      };

      window.addEventListener(eventName, callback);
      window.addEventListener("storage", onStorage);

      return () => {
        window.removeEventListener(eventName, callback);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}
