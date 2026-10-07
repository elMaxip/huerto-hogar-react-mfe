export const HOST_PORT = 5173;

export const REMOTES = {
  shop: 5174,
  auth: 5175,
  cart: 5176,
} as const;

export type RemoteName = keyof typeof REMOTES;

export function remoteOrigin(name: RemoteName): string {
  const fromEnv = process.env[`${name.toUpperCase()}_URL`];

  return (fromEnv ?? `http://localhost:${REMOTES[name]}`).replace(/\/$/, "");
}

export const SHARED = {
  react: { singleton: true },
  "react-dom": { singleton: true },
  "react-router": { singleton: true },
};

export const CONFIG = {
  filename: "remoteEntry.js",
  dts: {
    tsConfigPath: "./tsconfig.app.json",
    consumeTypes: {
      typesFolder: "node_modules/@mf-types",
    },
  },
  dev: {
    remoteHmr: true,
  },
  shared: SHARED,
};
