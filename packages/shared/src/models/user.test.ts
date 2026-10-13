import { describe, expect, it } from "vitest";
import { isAdmin, normalizeRole, Role } from "./user";

describe("normalizeRole", () => {
  it("mantiene el rol de administrador", () => {
    expect(normalizeRole("admin")).toBe(Role.Admin);
  });

  it.each([["client"], [undefined], [null], ["superadmin"], [1]])(
    "trata %s como cliente",
    (role) => {
      expect(normalizeRole(role)).toBe(Role.Client);
    },
  );
});

describe("isAdmin", () => {
  it("es true solo para usuarios administradores", () => {
    expect(isAdmin({ role: Role.Admin })).toBe(true);
    expect(isAdmin({ role: Role.Client })).toBe(false);
  });

  it("es false sin usuario", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
