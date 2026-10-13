import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderRoutes } from "../../test/renderRoutes";
import SessionMenu from "./SessionMenu";

// Simula que el remoto auth está apagado: su módulo no se puede cargar
vi.mock("auth/SessionCard", () => {
  throw new Error("No se pudo cargar auth/remoteEntry.js");
});

describe("SessionMenu con el remoto auth caído", () => {
  it("muestra un mensaje en el modal sin romper la página", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = renderRoutes([{ path: "/", Component: SessionMenu }]);

    await user.click(screen.getByRole("button", { name: "Cuenta" }));

    expect(
      await screen.findByText("No se pudo cargar la cuenta."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Cuenta" })).toBeInTheDocument();
  });
});
