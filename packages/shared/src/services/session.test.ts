import { describe, expect, it, vi } from "vitest";
import { Role, type User } from "../models/user";
import {
  getSession,
  login,
  logout,
  parseSession,
  SESSION_CHANGE_EVENT,
} from "./session";

const user: User = {
  id: 7,
  fullname: "Ana Pérez",
  email: "ana@correo.cl",
  password: "secreta123",
  role: Role.Client,
};

describe("parseSession", () => {
  it("devuelve null si no hay sesión o es inválida", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("no es json")).toBeNull();
    expect(parseSession('{"fullname":"Ana"}')).toBeNull();
    expect(parseSession('{"email":"ana@correo.cl"}')).toBeNull();
  });

  it("descarta campos extra y normaliza el rol", () => {
    const saved = JSON.stringify({
      id: 1,
      fullname: "Ana",
      email: "ana@correo.cl",
      password: "no debería estar",
      role: "superadmin",
    });

    expect(parseSession(saved)).toEqual({
      id: 1,
      fullname: "Ana",
      email: "ana@correo.cl",
      role: Role.Client,
    });
  });
});

describe("login y logout", () => {
  it("guarda la sesión sin la contraseña", () => {
    login(user);

    expect(localStorage.getItem("user")).not.toContain("secreta123");
    expect(getSession()).toEqual({
      id: 7,
      fullname: "Ana Pérez",
      email: "ana@correo.cl",
      role: Role.Client,
    });
  });

  it("emite el evento de cambio de sesión", () => {
    const listener = vi.fn();
    window.addEventListener(SESSION_CHANGE_EVENT, listener);

    login(user);
    logout();

    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener(SESSION_CHANGE_EVENT, listener);
  });

  it("cierra la sesión", () => {
    login(user);
    logout();

    expect(getSession()).toBeNull();
  });
});
