import { act, screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { login, logout } from "@huerto/shared";
import { testUsers } from "@huerto/shared/testing";
import { renderRoutes } from "../../test/renderRoutes";
import AdminLayout from "./AdminLayout";

function CurrentUrl() {
  const { pathname, search } = useLocation();

  return <p>URL: {pathname + search}</p>;
}

function renderLayout(path = "/admin") {
  return renderRoutes(
    [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { index: true, element: <p>Listado de productos</p> },
          { path: "products/new", element: <p>Formulario</p> },
        ],
      },
      { path: "*", Component: CurrentUrl },
    ],
    path,
  );
}

describe("AdminLayout", () => {
  it("muestra la navegación del panel y la ruta hija para administradores", async () => {
    login(testUsers.admin);
    renderLayout();

    expect(
      await screen.findByText("Panel de administración"),
    ).toBeInTheDocument();
    expect(screen.getByText("Listado de productos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Listado" })).toHaveClass(
      "active",
    );
    expect(screen.getByRole("link", { name: "Nuevo producto" })).toHaveAttribute(
      "href",
      "/admin/products/new",
    );
  });

  it("navega entre las secciones del panel", async () => {
    login(testUsers.admin);
    const { user } = renderLayout();

    await user.click(await screen.findByRole("link", { name: "Nuevo producto" }));

    expect(screen.getByText("Formulario")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nuevo producto" })).toHaveClass(
      "active",
    );
  });

  it("redirige al login sin sesión", async () => {
    renderLayout("/admin/products/new");

    expect(
      await screen.findByText("URL: /login?redirectTo=%2Fadmin%2Fproducts%2Fnew"),
    ).toBeInTheDocument();
  });

  it("redirige al inicio si el usuario no es administrador", async () => {
    login(testUsers.client);
    renderLayout();

    expect(await screen.findByText("URL: /")).toBeInTheDocument();
  });

  it("saca al usuario del panel si cierra sesión con el panel abierto", async () => {
    login(testUsers.admin);
    renderLayout();
    await screen.findByText("Listado de productos");

    act(() => logout());

    expect(
      await screen.findByText("URL: /login?redirectTo=%2Fadmin"),
    ).toBeInTheDocument();
  });
});
