import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@huerto/shared/styles.css";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import * as layout from "./routes/layout";
import * as products from "./routes/products";
import * as productForm from "./routes/productForm";

const router = createBrowserRouter([
  { index: true, loader: () => redirect("/admin") },
  {
    path: "admin",
    ...layout,
    children: [
      { index: true, ...products },
      { path: "products/new", ...productForm },
      { path: "products/:productId", ...productForm },
    ],
  },
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
