import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import RouteError from "./pages/RouteError/RouteError";
import PageLoader from "./components/PageLoader/PageLoader";
import NotFound from "./pages/NotFound/NotFound";

export const router = createBrowserRouter([
  {
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoader,
    children: [
      {
        Component: RootLayout,
        children: [
          {
            ErrorBoundary: RouteError,
            children: [
              { index: true, lazy: () => import("shop/home") },
              { path: "*", Component: NotFound },
            ],
          },
        ],
      },
    ],
  },
]);
