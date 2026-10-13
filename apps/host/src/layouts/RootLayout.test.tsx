import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderRoutes } from "../test/renderRoutes";
import RootLayout from "./RootLayout";

vi.mock(import("../components/SessionMenu/SessionMenu"), () => ({
  default: () => <button>Cuenta</button>,
}));

describe("RootLayout", () => {
  it("muestra la barra de progreso mientras carga la siguiente página", async () => {
    let finish!: () => void;
    const { user, container } = renderRoutes([
      {
        Component: RootLayout,
        children: [
          { path: "/", element: <h1>Inicio</h1> },
          {
            path: "/catalog",
            loader: () => new Promise((resolve) => (finish = () => resolve(null))),
            element: <h1>Catálogo de productos</h1>,
          },
        ],
      },
    ]);

    const progress = container.querySelector(".progress");
    const main = screen.getByRole("main");

    expect(screen.getAllByRole("navigation")[0]).toHaveTextContent("HuertoHogar");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(main).toContainElement(screen.getByRole("heading", { name: "Inicio" }));
    expect(progress).toHaveAttribute("data-active", "false");
    expect(main).toHaveAttribute("aria-busy", "false");

    await user.click(screen.getAllByRole("link", { name: "Catálogo" })[0]);

    expect(progress).toHaveAttribute("data-active", "true");
    expect(main).toHaveAttribute("aria-busy", "true");

    finish();

    expect(
      await screen.findByRole("heading", { name: "Catálogo de productos" }),
    ).toBeInTheDocument();
    expect(progress).toHaveAttribute("data-active", "false");
  });
});
