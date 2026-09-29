/**
 * Entrada para desarrollar el remoto por separado (http://localhost:5175/login).
 * Dentro del host no se usa: el host solo carga los módulos de `exposes`.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "@huerto/shared/styles.css";
import * as login from "./routes/login";
import * as register from "./routes/register";
import SessionCard from "./components/SessionCard/SessionCard";

const router = createBrowserRouter([
  { path: "login", ...login },
  { path: "register", ...register },
  // Para ver la tarjeta de sesión aislada
  { path: "session", element: <SessionCard /> },
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
