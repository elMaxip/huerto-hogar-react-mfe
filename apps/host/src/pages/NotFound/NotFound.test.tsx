import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "../../test/renderRoutes";
import NotFound from "./NotFound";

describe("NotFound", () => {
  it("muestra la ruta que no existe y vuelve al inicio", async () => {
    const { user } = renderRoutes(
      [
        { path: "/", element: <h1>Inicio</h1> },
        { path: "*", Component: NotFound },
      ],
      "/blog/primer-post",
    );

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(
      screen.getByText("No existe la página /blog/primer-post"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));

    expect(screen.getByRole("heading", { name: "Inicio" })).toBeInTheDocument();
  });
});
