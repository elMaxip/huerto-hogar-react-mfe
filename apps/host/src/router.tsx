import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import RouteError from "./pages/RouteError/RouteError";

export const router = createBrowserRouter([
  {
    ErrorBoundary: RouteError,
    children: [
      {
        Component: RootLayout,
        children: [
          {
            ErrorBoundary: RouteError,
            children: [],
          },
        ],
      },
    ],
  },
]);
