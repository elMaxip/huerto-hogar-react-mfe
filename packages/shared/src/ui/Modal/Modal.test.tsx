import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("no renderiza nada si está cerrado", () => {
    render(
      <Modal open={false} onClose={() => {}} label="Cuenta">
        Contenido
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("se renderiza en document.body con su etiqueta accesible", () => {
    const { container } = render(
      <Modal open onClose={() => {}} label="Cuenta">
        Contenido
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Cuenta" });

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent("Contenido");
    expect(container).not.toContainElement(dialog);
    expect(dialog).toHaveFocus();
  });

  it("se cierra con Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} label="Cuenta">
        Contenido
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignora las demás teclas", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} label="Cuenta">
        Contenido
      </Modal>,
    );

    await user.keyboard("{Enter}a");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("se cierra al hacer clic fuera del panel, pero no dentro", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} label="Cuenta">
        <p>Contenido</p>
      </Modal>,
    );

    await user.click(screen.getByText("Contenido"));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("se cierra sin errores si no había ningún elemento con foco", () => {
    vi.spyOn(document, "activeElement", "get").mockReturnValue(null);

    const { rerender } = render(
      <Modal open onClose={() => {}} label="Cuenta">
        Contenido
      </Modal>,
    );

    rerender(
      <Modal open={false} onClose={() => {}} label="Cuenta">
        Contenido
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("devuelve el foco al elemento que lo abrió al cerrarse", async () => {
    const user = userEvent.setup();

    function Example() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir</button>
          <Modal open={open} onClose={() => setOpen(false)} label="Cuenta">
            Contenido
          </Modal>
        </>
      );
    }

    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("dialog")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir" })).toHaveFocus();
  });
});
