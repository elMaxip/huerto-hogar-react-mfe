import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { login, logout } from "@huerto/shared";
import { testUsers } from "@huerto/shared/testing";
import Navbar from "./Navbar";

// El menú de cuenta carga un remoto; aquí basta con su botón
vi.mock(import("../SessionMenu/SessionMenu"), () => ({
  default: () => <button>Cuenta</button>,
}));

function renderNavbar(path = "/") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("muestra la marca, los enlaces principales y el menú de cuenta", () => {
    renderNavbar();

    expect(
      screen.getByRole("heading", { name: "HuertoHogar" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link").map((link) => link.textContent),
    ).toEqual(["Inicio", "Catálogo", "Blog", "Nosotros", "Carrito"]);
    expect(screen.getByRole("button", { name: "Cuenta" })).toBeInTheDocument();
  });

  it("marca el enlace de la página actual", () => {
    renderNavbar("/catalog/frutas-frescas");

    expect(screen.getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // "Inicio" usa `end`, así que no queda activo en otras rutas
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("muestra el enlace de administración solo a administradores", () => {
    login(testUsers.client);
    renderNavbar();

    expect(
      screen.queryByRole("link", { name: "Administración" }),
    ).not.toBeInTheDocument();

    act(() => login(testUsers.admin));

    expect(
      screen.getByRole("link", { name: "Administración" }),
    ).toHaveAttribute("href", "/admin");

    act(() => logout());

    expect(
      screen.queryByRole("link", { name: "Administración" }),
    ).not.toBeInTheDocument();
  });
});
