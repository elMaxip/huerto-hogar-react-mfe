import { act, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderRoutes } from "../../test/renderRoutes";
import SessionMenu from "./SessionMenu";

vi.mock("auth/SessionCard", () => ({
  default: () => <p>Tarjeta de sesión</p>,
}));

function renderMenu() {
  return renderRoutes([
    {
      path: "*",
      Component: SessionMenu,
    },
  ]);
}

describe("SessionMenu", () => {
  it("empieza cerrado", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: "Cuenta" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre un modal con la tarjeta de sesión del remoto auth", async () => {
    const { user } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Cuenta" }));

    expect(screen.getByRole("dialog", { name: "Cuenta" })).toBeInTheDocument();
    expect(await screen.findByText("Tarjeta de sesión")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cuenta" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("se cierra con Escape", async () => {
    const { user } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    await screen.findByText("Tarjeta de sesión");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("se cierra al cambiar de página", async () => {
    const { user, router } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    await screen.findByText("Tarjeta de sesión");

    await act(() => router.navigate("/catalog"));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Cuenta" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
