import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { federation } from "@module-federation/vite";
import { defineConfig } from "vite";
import { REMOTES, SHARED, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("cart");

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Los assets (imágenes, chunks) tienen que pedirse a este servidor y no al
  // del host, que es donde se ejecuta el código del remoto
  base: command === "build" ? `${ORIGIN}/` : "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./cart": "./src/routes/cart.ts",
      },
      shared: SHARED,
      dts: false,
      bundleAllCSS: true,
    }),
  ],
  server: {
    port: REMOTES.cart,
    strictPort: true,
    origin: ORIGIN,
  },
  preview: {
    port: REMOTES.cart,
    strictPort: true,
  },
}));
