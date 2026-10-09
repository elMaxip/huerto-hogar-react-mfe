import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as register from "./routes/register"
import * as login from "./routes/login"
import { createBrowserRouter, RouterProvider } from 'react-router';
import "@huerto/shared/styles.css"

const router = createBrowserRouter([
  { index: true, ...register },
  { path: "register", ...register },
  { path: "login", ...login },
  {
    path: "*",
    element: <p>Esta ruta pertenece a otro micro-frontend.</p>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
