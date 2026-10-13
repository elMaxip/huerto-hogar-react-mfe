import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { routes } from "../router";
import { renderRoutes } from "../test/renderRoutes";

// Simula que el servidor del remoto cart está apagado
vi.mock("cart/cart", () => {
  throw new TypeError("Failed to fetch dynamically imported module");
});

describe("host con un micro-frontend caído", () => {
  it("muestra el error solo en la sección del remoto caído", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = renderRoutes(routes, "/cart");

    expect(
      await screen.findByRole("heading", { name: "Algo salió mal" }),
    ).toBeInTheDocument();

    // El resto de la aplicación sigue funcionando
    const navbar = within(screen.getAllByRole("navigation")[0]);
    await user.click(navbar.getByRole("link", { name: "Inicio" }));

    expect(
      await screen.findByRole("heading", { name: "Promociones" }),
    ).toBeInTheDocument();
  });
});
