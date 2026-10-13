import { defineConfig } from "vitest/config";

// Separada de vite.config.ts para no cargar Module Federation en las pruebas
export default defineConfig({
  resolve: {
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
