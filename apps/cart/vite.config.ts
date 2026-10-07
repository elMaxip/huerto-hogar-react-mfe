import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { CONFIG, REMOTES, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("cart");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      ...CONFIG,
      name: "products",
      exposes: {
        "./cart": "./src/routes/cart.ts",
      },
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
});
