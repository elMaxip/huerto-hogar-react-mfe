import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { CONFIG, REMOTES, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("admin");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      ...CONFIG,
      name: "admin",
      exposes: {
        "./layout": "./src/routes/layout.ts",
        "./products": "./src/routes/products.ts",
        "./productForm": "./src/routes/productForm.ts",
      },
    }),
  ],
  server: {
    port: REMOTES.admin,
    strictPort: true,
    origin: ORIGIN,
  },
  preview: {
    port: REMOTES.admin,
    strictPort: true,
  },
});
