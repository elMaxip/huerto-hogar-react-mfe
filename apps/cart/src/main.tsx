/**
 * Entrada para desarrollar el remoto por separado (http://localhost:5176/cart).
 * Dentro del host no se usa: el host solo carga los módulos de `exposes`.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "@huerto/shared/styles.css";
import * as cart from "./routes/cart";

const router = createBrowserRouter([
  { path: "cart", ...cart },
  {
    path: "*",
    element: <p>Esta ruta pertenece a otro micro-frontend.</p>,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
