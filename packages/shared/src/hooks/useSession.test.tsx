import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Role } from "../models/user";
import { login, logout } from "../services/session";
import { useSession } from "./useSession";

const admin = {
  id: 1,
  fullname: "Administrador",
  email: "admin@huertohogar.cl",
  password: "admin1234",
  role: Role.Admin,
};

describe("useSession", () => {
  it("devuelve null sin sesión", () => {
    const { result } = renderHook(() => useSession());

    expect(result.current).toBeNull();
  });

  it("refleja el inicio y cierre de sesión", () => {
    const { result } = renderHook(() => useSession());

    act(() => login(admin));
    expect(result.current).toEqual({
      id: 1,
      fullname: "Administrador",
      email: "admin@huertohogar.cl",
      role: Role.Admin,
    });

    act(() => logout());
    expect(result.current).toBeNull();
  });

  it("se actualiza al cerrar sesión en otra pestaña", () => {
    login(admin);
    const { result } = renderHook(() => useSession());
    expect(result.current).not.toBeNull();

    act(() => {
      localStorage.removeItem("user");
      window.dispatchEvent(new StorageEvent("storage", { key: "user" }));
    });

    expect(result.current).toBeNull();
  });
});
