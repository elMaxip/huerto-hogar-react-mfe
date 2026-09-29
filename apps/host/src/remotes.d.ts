/**
 * Tipos de los módulos que exponen los remotos (ver `exposes` en el
 * vite.config.ts de cada app). Los módulos de ruta siguen la forma que
 * espera `lazy` de react-router.
 */

type RouteModule = {
  Component: import("react").ComponentType;
  loader?: import("react-router").LoaderFunction;
};

declare module "shop/home" {
  export const Component: RouteModule["Component"];
  export const loader: RouteModule["loader"];
}

declare module "shop/catalog" {
  export const Component: RouteModule["Component"];
  export const loader: RouteModule["loader"];
}

declare module "shop/product" {
  export const Component: RouteModule["Component"];
  export const loader: RouteModule["loader"];
}

declare module "cart/cart" {
  export const Component: RouteModule["Component"];
  export const loader: RouteModule["loader"];
}

declare module "auth/login" {
  export const Component: RouteModule["Component"];
}

declare module "auth/register" {
  export const Component: RouteModule["Component"];
}

declare module "auth/SessionCard" {
  const SessionCard: import("react").ComponentType;
  export default SessionCard;
}
