import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageLoader from "../PageLoader/PageLoader";
import RemoteBoundary from "./RemoteBoundary";

function BrokenRemote(): never {
  throw new Error("remoteEntry.js no disponible");
}

describe("RemoteBoundary", () => {
  it("renderiza el contenido si no hay errores", () => {
    render(
      <RemoteBoundary fallback={<p>Falló</p>}>
        <p>Contenido remoto</p>
      </RemoteBoundary>,
    );

    expect(screen.getByText("Contenido remoto")).toBeInTheDocument();
    expect(screen.queryByText("Falló")).not.toBeInTheDocument();
  });

  it("muestra el fallback y registra el error si el remoto falla", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <>
        <RemoteBoundary fallback={<p>No se pudo cargar</p>}>
          <BrokenRemote />
        </RemoteBoundary>
        <p>Resto de la página</p>
      </>,
    );

    expect(screen.getByText("No se pudo cargar")).toBeInTheDocument();
    expect(screen.getByText("Resto de la página")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Error al cargar un micro-frontend",
      expect.objectContaining({ message: "remoteEntry.js no disponible" }),
    );
  });
});

describe("PageLoader", () => {
  it("anuncia la carga a los lectores de pantalla", () => {
    render(<PageLoader />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
  });
});
