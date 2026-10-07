import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";
import { CONFIG, REMOTES, remoteOrigin } from "../../federation.config.ts";

const ORIGIN = remoteOrigin("auth");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      ...CONFIG,
      name: "auth",
      /*  exposes: {
        "./login": "./src/routes/login.ts",
        "./register": "./src/routes/register.ts",
        "./SessionCard": "./src/components/SessionCard/SessionCard.tsx",
      }, */
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
});
