import { createElement } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from "react-router";

/** Renderiza las rutas con un router en memoria que empieza en `initialEntry` */
export function renderRoutes(routes: RouteObject[], initialEntry = "/") {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });

  return {
    user: userEvent.setup(),
    router,
    ...render(createElement(RouterProvider, { router })),
  };
}
