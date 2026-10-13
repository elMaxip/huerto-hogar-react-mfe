import { screen } from "@testing-library/react";
import { data } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { renderRoutes } from "../../test/renderRoutes";
import RouteError from "./RouteError";

function renderError(loader: () => never, path = "/seccion") {
  return renderRoutes(
    [
      { path: "/seccion", loader, Component: () => null, ErrorBoundary: RouteError },
      { path: "/", element: <h1>Inicio</h1> },
    ],
    path,
  );
}

describe("RouteError", () => {
  it("muestra la página 404 para respuestas 404", async () => {
    renderError(() => {
      throw data("Producto no encontrado", { status: 404 });
    });

    expect(
      await screen.findByRole("heading", { name: "404" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No existe la página /seccion")).toBeInTheDocument();
  });

  it("muestra acceso denegado para respuestas 403", async () => {
    const { user } = renderError(() => {
      throw data("Solo administradores", { status: 403 });
    });

    expect(
      await screen.findByRole("heading", { name: "Acceso denegado" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));

    expect(screen.getByRole("heading", { name: "Inicio" })).toBeInTheDocument();
  });

  it("muestra un error genérico si un remoto no está disponible", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new TypeError("Failed to fetch dynamically imported module");

    renderError(() => {
      throw error;
    });

    expect(
      await screen.findByRole("heading", { name: "Algo salió mal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(consoleError).toHaveBeenCalledWith(error);
  });
});
