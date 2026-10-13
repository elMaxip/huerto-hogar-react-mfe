/**
 * IndexedDB mínimo en memoria para probar los servicios de la base de datos
 * sin depender del navegador. Solo implementa lo que usan `product.ts` y
 * `user.ts`: getAll, get, add, put, delete e índices con get/getAll.
 */

type Row = Record<string, unknown>;

interface StoreOptions {
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: Record<string, string>;
}

/** Imita un IDBRequest: resuelve después de que se asignan los handlers */
function fakeRequest<T>(run: () => T) {
  const req: {
    result?: T;
    error?: unknown;
    onsuccess: (() => void) | null;
    onerror: (() => void) | null;
  } = { onsuccess: null, onerror: null };

  queueMicrotask(() => {
    try {
      req.result = run();
      req.onsuccess?.();
    } catch (error) {
      req.error = error;
      req.onerror?.();
    }
  });

  return req;
}

function createStore({ keyPath, autoIncrement, indexes = {} }: StoreOptions) {
  const rows = new Map<unknown, Row>();
  let nextKey = 1;

  function keyOf(row: Row) {
    if (row[keyPath] === undefined && autoIncrement) {
      row[keyPath] = nextKey++;
    }

    return row[keyPath];
  }

  const store = {
    rows,
    getAll: () => fakeRequest(() => [...rows.values()]),
    get: (key: unknown) => fakeRequest(() => rows.get(key)),
    add: (value: Row) =>
      fakeRequest(() => {
        const row = { ...value };
        const key = keyOf(row);

        if (rows.has(key)) {
          throw new DOMException("La clave ya existe", "ConstraintError");
        }

        rows.set(key, row);
        return key;
      }),
    put: (value: Row) =>
      fakeRequest(() => {
        const row = { ...value };
        const key = keyOf(row);

        rows.set(key, row);
        return key;
      }),
    delete: (key: unknown) => fakeRequest(() => void rows.delete(key)),
    index: (name: string) => {
      const field = indexes[name];
      const matching = (value: unknown) =>
        [...rows.values()].filter((row) => row[field] === value);

      return {
        get: (value: unknown) => fakeRequest(() => matching(value)[0]),
        getAll: (value: unknown) => fakeRequest(() => matching(value)),
      };
    },
  };

  return store;
}

export function createFakeDatabase() {
  const stores = {
    products: createStore({
      keyPath: "id",
      indexes: { category_idx: "category" },
    }),
    users: createStore({
      keyPath: "id",
      autoIncrement: true,
      indexes: { email_idx: "email" },
    }),
  };

  const db = {
    stores,
    transaction: (name: keyof typeof stores) => ({
      objectStore: () => stores[name],
    }),
  };

  return db as typeof db & IDBDatabase;
}
