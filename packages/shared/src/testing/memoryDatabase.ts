/**
 * Base de datos en memoria para las pruebas de los micro-frontends.
 *
 * Reemplaza las funciones de IndexedDB de `@huerto/shared` (jsdom no tiene
 * IndexedDB). Cada app la registra en su `setup.ts` con `vi.mock` y la
 * reinicia antes de cada prueba con `resetMemoryDatabase()`.
 */
import { vi } from "vitest";
import type * as Shared from "../index";
import type { Category, Product } from "../models/product";
import { normalizeRole, Role, type NewUser, type User } from "../models/user";
import { DEFAULT_ADMIN, INITIAL_PRODUCTS } from "../services/database/seed";

export const testUsers = {
  admin: { ...DEFAULT_ADMIN, id: 1 },
  client: {
    id: 2,
    fullname: "Cliente de Prueba",
    email: "cliente@correo.cl",
    password: "cliente123",
    role: Role.Client,
  },
} satisfies Record<string, User>;

let products: Product[] = [];
let users: User[] = [];

function withRole(user: User | undefined): User | undefined {
  return user && { ...user, role: normalizeRole(user.role) };
}

export const memoryDatabase = {
  getProducts: vi.fn(async () => structuredClone(products)),

  getProduct: vi.fn(async (id: string) =>
    structuredClone(products.find((product) => product.id === id)),
  ),

  getProductsByCategory: vi.fn(async (category: Category) =>
    structuredClone(products.filter((product) => product.category === category)),
  ),

  createProduct: vi.fn(async (product: Product) => {
    if (products.some(({ id }) => id === product.id)) {
      throw new DOMException("El producto ya existe", "ConstraintError");
    }

    products.push(structuredClone(product));
  }),

  updateProduct: vi.fn(async (product: Product) => {
    products = [
      ...products.filter(({ id }) => id !== product.id),
      structuredClone(product),
    ];
  }),

  deleteProduct: vi.fn(async (id: string) => {
    products = products.filter((product) => product.id !== id);
  }),

  register: vi.fn(async (user: NewUser) => {
    if (users.some(({ email }) => email === user.email)) {
      throw new DOMException("El correo ya existe", "ConstraintError");
    }

    const id = Math.max(0, ...users.map(({ id }) => id)) + 1;
    users.push({ ...user, id });

    return { ...user, id };
  }),

  getUser: vi.fn(async (email: string) =>
    withRole(users.find((user) => user.email === email)),
  ),

  getUserById: vi.fn(async (id: number) =>
    withRole(users.find((user) => user.id === id)),
  ),
} satisfies Partial<typeof Shared>;

/** Vuelve a los datos iniciales y reinicia los mocks (llamadas e implementaciones de una prueba) */
export function resetMemoryDatabase(
  initial: { products?: Product[]; users?: User[] } = {},
) {
  products = structuredClone(initial.products ?? INITIAL_PRODUCTS);
  users = structuredClone(
    initial.users ?? [testUsers.admin, testUsers.client],
  );

  for (const fn of Object.values(memoryDatabase)) fn.mockReset();
}

/** Copia del contenido actual, para revisar el resultado de una prueba */
export function getMemoryData() {
  return { products: structuredClone(products), users: structuredClone(users) };
}

resetMemoryDatabase();
