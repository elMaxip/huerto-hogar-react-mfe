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

    subscribe(callback: () => void) {
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
