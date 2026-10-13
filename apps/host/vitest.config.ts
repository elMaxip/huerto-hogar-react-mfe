import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Módulos que exponen los remotos (ver `exposes` en el vite.config.ts de cada
 * app). En las pruebas se importan directo desde su código fuente, así el host
 * se prueba junto a los micro-frontends reales sin levantar sus servidores.
 */
const REMOTE_MODULES = {
  "shop/home": "../shop/src/routes/home.ts",
  "shop/catalog": "../shop/src/routes/catalog.ts",
  "shop/product": "../shop/src/routes/product.ts",
  "auth/login": "../auth/src/routes/login.ts",
  "auth/register": "../auth/src/routes/register.ts",
  "auth/SessionCard": "../auth/src/components/SessionCard/SessionCard.tsx",
  "cart/cart": "../cart/src/routes/cart.ts",
  "admin/layout": "../admin/src/routes/layout.ts",
  "admin/products": "../admin/src/routes/products.ts",
  "admin/productForm": "../admin/src/routes/productForm.ts",
};

// Separada de vite.config.ts para no cargar Module Federation en las pruebas
export default defineConfig({
  resolve: {
    alias: Object.entries(REMOTE_MODULES).map(([find, path]) => ({
      find,
      replacement: fileURLToPath(new URL(path, import.meta.url)),
    })),
    dedupe: ["react", "react-dom", "react-router"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: { modules: { classNameStrategy: "non-scoped" } },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.test.{ts,tsx}", "src/main.tsx"],
    },
  },
});
