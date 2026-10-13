import { screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { getSession, getUser } from "@huerto/shared";
import { testUsers } from "@huerto/shared/testing";
import { renderRoutes } from "../../test/renderRoutes";
import Login from "./Login";

function CurrentUrl() {
  return <p>URL: {useLocation().pathname}</p>;
}

function renderLogin(url = "/login") {
  return renderRoutes(
    [
      { path: "/login", Component: Login },
      { path: "*", Component: CurrentUrl },
    ],
    url,
  );
}

async function submit(
  user: ReturnType<typeof renderLogin>["user"],
  email: string,
  password: string,
) {
  if (email) await user.type(screen.getByLabelText("Correo electrónico"), email);
  if (password) await user.type(screen.getByLabelText("Contraseña"), password);
  await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
}

describe("Login", () => {
  it("muestra el formulario con un enlace al registro", () => {
    renderLogin();

    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("link", { name: "¿No tienes cuenta?" }),
    ).toHaveAttribute("href", "/register");
  });

  it("valida el correo y el largo de la contraseña", async () => {
    const { user } = renderLogin();

    await submit(user, "correo-invalido", "123");

    expect(
      await screen.findByText("Correo electrónico no válido"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La contraseña debe tener mínimo 8 caracteres"),
    ).toBeInTheDocument();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("avisa si no existe una cuenta con ese correo", async () => {
    const { user } = renderLogin();

    await submit(user, "nadie@correo.cl", "contraseña123");

    expect(
      await screen.findByText("No existe una cuenta con este correo electrónico"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInvalid();
    expect(getSession()).toBeNull();
  });

  it("avisa si la contraseña es incorrecta", async () => {
    const { user } = renderLogin();

    await submit(user, testUsers.client.email, "otraClave123");

    expect(
      await screen.findByText("Las contraseñas no coinciden"),
    ).toBeInTheDocument();
    expect(getSession()).toBeNull();
  });

  it("inicia sesión y vuelve al inicio", async () => {
    const { user } = renderLogin();

    await submit(user, testUsers.client.email, testUsers.client.password);

    expect(await screen.findByText("URL: /")).toBeInTheDocument();
    expect(getSession()).toEqual({
      id: testUsers.client.id,
      fullname: testUsers.client.fullname,
      email: testUsers.client.email,
      role: "client",
    });
  });

  it("vuelve a la página que pidió el login", async () => {
    const { user } = renderLogin("/login?redirectTo=%2Fadmin%2Fproducts");

    await submit(user, testUsers.admin.email, testUsers.admin.password);

    expect(await screen.findByText("URL: /admin/products")).toBeInTheDocument();
  });

  it.each(["//sitio-malicioso.com", "https://sitio-malicioso.com"])(
    "no redirige a otro sitio (%s)",
    async (redirectTo) => {
      const { user, router } = renderLogin(
        `/login?redirectTo=${encodeURIComponent(redirectTo)}`,
      );

      await submit(user, testUsers.client.email, testUsers.client.password);

      expect(await screen.findByText("URL: /")).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/");
    },
  );

  it("deshabilita el botón mientras busca al usuario", async () => {
    let finish!: () => void;
    vi.mocked(getUser).mockImplementationOnce(
      () => new Promise((resolve) => (finish = () => resolve(undefined))),
    );
    const { user } = renderLogin();

    await submit(user, "nadie@correo.cl", "contraseña123");

    expect(
      await screen.findByRole("button", { name: "Ingresando…" }),
    ).toBeDisabled();

    finish();

    expect(
      await screen.findByRole("button", { name: "Iniciar sesión" }),
    ).toBeEnabled();
  });
});
