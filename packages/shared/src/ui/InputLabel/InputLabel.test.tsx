import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InputLabel } from "./InputLabel";

describe("InputLabel", () => {
  it("asocia la etiqueta con el campo", () => {
    render(<InputLabel label="Correo electrónico" type="email" />);

    const input = screen.getByLabelText("Correo electrónico");

    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeValid();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra el error y lo vincula al campo", () => {
    render(<InputLabel label="Nombre" error="El nombre es obligatorio" />);

    const input = screen.getByLabelText("Nombre");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El nombre es obligatorio",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("El nombre es obligatorio");
    expect(input).toHaveClass("invalid");
  });

  it("pasa las props al input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <InputLabel
        label="Nombre"
        placeholder="Tu nombre"
        onChange={onChange}
        className="extra"
      />,
    );

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Ana");

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Nombre").closest(".extra")).not.toBeNull();
  });
});
