import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { federation } from "@module-federation/vite";
import { defineConfig } from "vite";
import { REMOTES, SHARED, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("auth");

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Los assets (imágenes, chunks) tienen que pedirse a este servidor y no al
  // del host, que es donde se ejecuta el código del remoto
  base: command === "build" ? `${ORIGIN}/` : "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      name: "auth",
      filename: "remoteEntry.js",
      exposes: {
        "./login": "./src/routes/login.ts",
        "./register": "./src/routes/register.ts",
        "./SessionCard": "./src/components/SessionCard/SessionCard.tsx",
      },
      shared: SHARED,
      dts: false,
      bundleAllCSS: true,
    }),
  ],
  server: {
    port: REMOTES.auth,
    strictPort: true,
    origin: ORIGIN,
  },
  preview: {
    port: REMOTES.auth,
    strictPort: true,
  },
}));
