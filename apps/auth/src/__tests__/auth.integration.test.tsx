import { screen } from "@testing-library/react";
import { Link, Outlet, type RouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import { getSession } from "@huerto/shared";
import SessionCard from "../components/SessionCard/SessionCard";
import * as login from "../routes/login";
import * as register from "../routes/register";
import { renderRoutes } from "../test/renderRoutes";

/** Imita el host: el menú de cuenta con SessionCard y las rutas expuestas */
const routes: RouteObject[] = [
  {
    element: (
      <>
        <aside aria-label="Cuenta">
          <SessionCard />
        </aside>
        <Outlet />
      </>
    ),
    children: [
      { path: "/", element: <Link to="/admin">Ir al panel</Link> },
      { path: "/login", ...login },
      { path: "/register", ...register },
      { path: "/admin", element: <h1>Panel</h1> },
    ],
  },
];

describe("flujo de autenticación", () => {
  it("registra una cuenta, inicia sesión y la cierra", async () => {
    const { user, router } = renderRoutes(routes, "/");

    await user.click(screen.getByRole("link", { name: "Registrar cuenta" }));

    await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "secreta123");
    await user.type(screen.getByLabelText("Confirma tu contraseña"), "secreta123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    // Después de registrarse se llega al login, todavía sin sesión
    await screen.findByRole("button", { name: "Iniciar sesión" });
    expect(router.state.location.pathname).toBe("/login");
    expect(getSession()).toBeNull();

    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "secreta123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Ana Pérez")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
    expect(
      screen.queryByRole("link", { name: "Panel de administración" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
    expect(getSession()).toBeNull();
  });

  it("no permite registrar dos veces el mismo correo", async () => {
    const { user } = renderRoutes(routes, "/register");

    for (let i = 0; i < 2; i++) {
      if (i === 1) {
        await user.click(
          await screen.findByRole("link", { name: "Registrar cuenta" }),
        );
      }

      await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
      await user.type(
        screen.getByLabelText("Correo electrónico"),
        "ana@correo.cl",
      );
      await user.type(screen.getByLabelText("Contraseña"), "secreta123");
      await user.type(
        screen.getByLabelText("Confirma tu contraseña"),
        "secreta123",
      );
      await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
    }

    expect(
      await screen.findByText("Ya existe una cuenta con este correo electrónico"),
    ).toBeInTheDocument();
  });

  it("vuelve al panel después de iniciar sesión como administrador", async () => {
    const { user, router } = renderRoutes(
      routes,
      "/login?redirectTo=%2Fadmin",
    );

    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "admin@huertohogar.cl",
    );
    await user.type(screen.getByLabelText("Contraseña"), "admin1234");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(
      await screen.findByRole("heading", { name: "Panel" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/admin");
    expect(
      screen.getByRole("link", { name: "Panel de administración" }),
    ).toBeVisible();
  });
});
