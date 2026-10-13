import { screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { getUser, register } from "@huerto/shared";
import { getMemoryData, testUsers } from "@huerto/shared/testing";
import { renderRoutes } from "../../test/renderRoutes";
import Register from "./Register";

function CurrentUrl() {
  return <p>URL: {useLocation().pathname}</p>;
}

function renderRegister() {
  return renderRoutes(
    [
      { path: "/register", Component: Register },
      { path: "*", Component: CurrentUrl },
    ],
    "/register",
  );
}

interface Fields {
  fullname: string;
  email: string;
  password: string;
  confirmedPassword: string;
}

const valid: Fields = {
  fullname: "Ana Pérez",
  email: "ana@correo.cl",
  password: "secreta123",
  confirmedPassword: "secreta123",
};

async function submit(
  user: ReturnType<typeof renderRegister>["user"],
  fields: Partial<Fields> = {},
) {
  const values = { ...valid, ...fields };
  const labels: Record<keyof Fields, string> = {
    fullname: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmedPassword: "Confirma tu contraseña",
  };

  for (const [field, label] of Object.entries(labels)) {
    const value = values[field as keyof Fields];
    if (value) await user.type(screen.getByLabelText(label), value);
  }

  await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

describe("Register", () => {
  it("muestra el formulario con un enlace al login", () => {
    renderRegister();

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirma tu contraseña")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("link", { name: "¿Tienes una cuenta?" }),
    ).toHaveAttribute("href", "/login");
  });

  it("valida todos los campos", async () => {
    const { user } = renderRegister();

    await submit(user, {
      fullname: "Al",
      email: "ana@",
      password: "123",
      confirmedPassword: "",
    });

    expect(
      await screen.findByText(
        "El nombre completo debe tener al menos 3 caracteres",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("El correo es inválido")).toBeInTheDocument();
    expect(
      screen.getAllByText("La contraseña debe tener mínimo 8 caracteres"),
    ).toHaveLength(2);
    expect(screen.getAllByRole("alert")).toHaveLength(4);
    expect(register).not.toHaveBeenCalled();
  });

  it("avisa si las contraseñas no coinciden", async () => {
    const { user } = renderRegister();

    await submit(user, { confirmedPassword: "distinta123" });

    expect(
      await screen.findByText("Las contraseñas no coinciden"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Confirma tu contraseña")).toBeInvalid();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("avisa si el correo ya está registrado", async () => {
    const { user } = renderRegister();

    await submit(user, { email: testUsers.client.email });

    expect(
      await screen.findByText("Ya existe una cuenta con este correo electrónico"),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("avisa si no se pudo crear la cuenta", async () => {
    vi.mocked(register).mockRejectedValueOnce(new Error("IndexedDB"));
    const { user } = renderRegister();

    await submit(user);

    expect(
      await screen.findByText("No se pudo crear la cuenta, intenta nuevamente"),
    ).toBeInTheDocument();
  });

  it("crea la cuenta como cliente y lleva al login", async () => {
    const { user } = renderRegister();

    await submit(user);

    expect(await screen.findByText("URL: /login")).toBeInTheDocument();
    expect(register).toHaveBeenCalledWith({
      fullname: "Ana Pérez",
      email: "ana@correo.cl",
      password: "secreta123",
      role: "client",
    });
    expect(getMemoryData().users).toContainEqual(
      expect.objectContaining({ email: "ana@correo.cl", role: "client" }),
    );
  });

  it("deshabilita el botón mientras crea la cuenta", async () => {
    let finish!: () => void;
    vi.mocked(getUser).mockImplementationOnce(
      () => new Promise((resolve) => (finish = () => resolve(testUsers.client))),
    );
    const { user } = renderRegister();

    await submit(user);

    expect(
      await screen.findByRole("button", { name: "Creando cuenta…" }),
    ).toBeDisabled();

    finish();

    expect(
      await screen.findByRole("button", { name: "Crear cuenta" }),
    ).toBeEnabled();
  });
});
