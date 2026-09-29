import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { federation } from "@module-federation/vite";
import { defineConfig } from "vite";
import {
  HOST_PORT,
  REMOTES,
  SHARED,
  remoteOrigin,
  type RemoteName,
} from "../../federation.config.ts";

const remotes = Object.fromEntries(
  (Object.keys(REMOTES) as RemoteName[]).map((name) => [
    name,
    {
      type: "module",
      name,
      entry: `${remoteOrigin(name)}/remoteEntry.js`,
    },
  ]),
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      name: "host",
      remotes,
      shared: SHARED,
      dts: false,
    }),
  ],
  server: {
    port: HOST_PORT,
    strictPort: true,
  },
  preview: {
    port: HOST_PORT,
    strictPort: true,
  },
});
