import { INITIAL_PRODUCTS } from "./seed";

const DB_NAME = "huertohogar-react";
const DB_VERSION = 1;

let connection: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  connection ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains("users")) {
        const objectStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });

        objectStore.createIndex("email_idx", "email", { unique: true });
      }

      if (!db.objectStoreNames.contains("products")) {
        const objectStore = db.createObjectStore("products", {
          keyPath: "id",
        });

        objectStore.createIndex("category_idx", "category");

        for (const product of INITIAL_PRODUCTS) {
          objectStore.add(product);
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      connection = null;
      reject(req.error);
    };
  });

  return connection;
}

export function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
