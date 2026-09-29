import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { federation } from "@module-federation/vite";
import { defineConfig } from "vite";
import { REMOTES, SHARED, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("shop");

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Los assets (imágenes, chunks) tienen que pedirse a este servidor y no al
  // del host, que es donde se ejecuta el código del remoto
  base: command === "build" ? `${ORIGIN}/` : "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      name: "shop",
      filename: "remoteEntry.js",
      exposes: {
        "./home": "./src/routes/home.ts",
        "./catalog": "./src/routes/catalog.ts",
        "./product": "./src/routes/product.ts",
      },
      shared: SHARED,
      dts: false,
      bundleAllCSS: true,
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
}));
