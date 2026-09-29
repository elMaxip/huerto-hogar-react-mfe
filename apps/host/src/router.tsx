import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import RouteError from "./pages/RouteError/RouteError";
import PageLoader from "./components/PageLoader/PageLoader";
import About from "./pages/About/About";
import Blog from "./pages/Blog/Blog";
import NotFound from "./pages/NotFound/NotFound";

/**
 * Las páginas de los remotos se cargan con `lazy`: cada módulo expuesto trae su
 * `Component` y su `loader`, así el router pide el código del micro-frontend y
 * sus datos en paralelo antes de mostrar la página.
 */
export const router = createBrowserRouter([
  {
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoader,
    children: [
      {
        // Páginas con navbar
        Component: RootLayout,
        children: [
          {
            // Un error aquí se muestra dentro del layout, sin perder la navbar
            ErrorBoundary: RouteError,
            children: [
              { index: true, lazy: () => import("shop/home") },
              { path: "catalog", lazy: () => import("shop/catalog") },
              { path: "catalog/:category", lazy: () => import("shop/catalog") },
              { path: "product/:productId", lazy: () => import("shop/product") },
              { path: "cart", lazy: () => import("cart/cart") },
              { path: "blog", Component: Blog },
              { path: "about", Component: About },
              { path: "*", Component: NotFound },
            ],
          },
        ],
      },
      // Páginas a pantalla completa, sin navbar
      { path: "login", lazy: () => import("auth/login") },
      { path: "register", lazy: () => import("auth/register") },
    ],
  },
]);
