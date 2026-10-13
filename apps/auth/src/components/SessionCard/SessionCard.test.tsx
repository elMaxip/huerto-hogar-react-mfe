import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { getSession, login, logout } from "@huerto/shared";
import { testUsers } from "@huerto/shared/testing";
import SessionCard from "./SessionCard";

function renderCard() {
  return render(
    <MemoryRouter>
      <SessionCard />
    </MemoryRouter>,
  );
}

describe("SessionCard", () => {
  it("muestra los enlaces de login y registro sin sesión", () => {
    renderCard();

    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: "Registrar cuenta" }),
    ).toHaveAttribute("href", "/register");
    expect(
      screen.queryByRole("button", { name: "Cerrar sesión" }),
    ).not.toBeInTheDocument();
  });

  it("muestra los datos del cliente sin el enlace al panel", () => {
    login(testUsers.client);
    renderCard();

    expect(screen.getByText(testUsers.client.fullname)).toBeInTheDocument();
    expect(screen.getByText(testUsers.client.email)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Panel de administración" }),
    ).not.toBeInTheDocument();
  });

  it("muestra el enlace al panel a los administradores", () => {
    login(testUsers.admin);
    renderCard();

    expect(
      screen.getByRole("link", { name: "Panel de administración" }),
    ).toHaveAttribute("href", "/admin");
  });

  it("cierra la sesión", async () => {
    login(testUsers.client);
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(getSession()).toBeNull();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  it("se actualiza si la sesión cambia fuera del componente", () => {
    renderCard();

    act(() => login(testUsers.admin));
    expect(screen.getByText(testUsers.admin.fullname)).toBeInTheDocument();

    act(() => logout());
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });
});
