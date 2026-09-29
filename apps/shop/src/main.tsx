/**
 * Entrada para desarrollar el remoto por separado (http://localhost:5174).
 * Dentro del host no se usa: el host solo carga los módulos de `exposes`.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "@huerto/shared/styles.css";
import * as home from "./routes/home";
import * as catalog from "./routes/catalog";
import * as product from "./routes/product";

const router = createBrowserRouter([
  { index: true, ...home },
  { path: "catalog", ...catalog },
  { path: "catalog/:category", ...catalog },
  { path: "product/:productId", ...product },
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
