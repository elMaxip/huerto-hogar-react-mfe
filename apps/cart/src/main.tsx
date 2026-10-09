import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@huerto/shared/styles.css"
import { createBrowserRouter, RouterProvider } from 'react-router'
import * as cart from "./routes/cart"

const router = createBrowserRouter([
  {index: true, ...cart}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
