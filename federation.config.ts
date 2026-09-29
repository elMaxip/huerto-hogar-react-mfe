/**
 * Topología de los micro-frontends. La importan los vite.config.ts de cada app
 * para que puertos, URLs y dependencias compartidas no se desincronicen.
 */

export const HOST_PORT = 5173;

export const REMOTES = {
  shop: 5174,
  auth: 5175,
  cart: 5176,
} as const;

export type RemoteName = keyof typeof REMOTES;

/**
 * Origen desde donde se sirve cada remoto. En producción se puede sobreescribir
 * con variables de entorno, por ejemplo SHOP_URL=https://shop.huertohogar.cl
 */
export function remoteOrigin(name: RemoteName): string {
  const fromEnv = process.env[`${name.toUpperCase()}_URL`];

  return (fromEnv ?? `http://localhost:${REMOTES[name]}`).replace(/\/$/, "");
}

/**
 * React y el router tienen que ser una única instancia en toda la página:
 * dos copias de React rompen los hooks y dos del router rompen el contexto
 * (un <Link> de un remoto no encontraría el router del host).
 */
export const SHARED = {
  react: { singleton: true },
  "react-dom": { singleton: true },
  "react-router": { singleton: true },
};
