import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PrimaryButton } from "./PrimaryButton";

describe("PrimaryButton", () => {
  it("es de tipo button por defecto para no enviar formularios", () => {
    render(<PrimaryButton>Guardar</PrimaryButton>);

    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("permite cambiar el tipo y agregar clases", () => {
    render(
      <PrimaryButton type="submit" className="extra">
        Enviar
      </PrimaryButton>,
    );

    const button = screen.getByRole("button", { name: "Enviar" });

    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("button", "extra");
  });

  it("ejecuta onClick al hacer clic", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Comprar</PrimaryButton>);

    await user.click(screen.getByRole("button", { name: "Comprar" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("no ejecuta onClick si está deshabilitado", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <PrimaryButton onClick={onClick} disabled>
        Comprar
      </PrimaryButton>,
    );

    await user.click(screen.getByRole("button", { name: "Comprar" }));

    expect(screen.getByRole("button")).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
