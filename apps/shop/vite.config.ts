import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { CONFIG, REMOTES, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("shop");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      ...CONFIG,
      name: "products",
      exposes: {
        "./home": "./src/routes/home.ts",
        "./catalog": "./src/routes/catalog.ts",
        "./product": "./src/routes/product.ts",
      },
    }),
  ],
  server: {
    port: REMOTES.shop,
    strictPort: true,
    origin: ORIGIN,
  },
  preview: {
    port: REMOTES.shop,
    strictPort: true,
  },
});
