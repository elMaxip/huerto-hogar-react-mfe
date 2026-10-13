import { describe, expect, it } from "vitest";
import { login } from "@huerto/shared";
import { testUsers } from "@huerto/shared/testing";
import { requireAdmin } from "./auth";

function args(path = "/admin") {
  return { request: new Request(`http://localhost${path}`) };
}

async function rejectionOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }

  throw new Error("Se esperaba que la promesa fallara");
}

describe("requireAdmin", () => {
  it("redirige al login sin sesión, recordando la ruta pedida", async () => {
    const error = await rejectionOf(requireAdmin(args("/admin/products/new")));

    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(302);
    expect((error as Response).headers.get("Location")).toBe(
      "/login?redirectTo=%2Fadmin%2Fproducts%2Fnew",
    );
  });

  it("responde 403 si el usuario es cliente", async () => {
    login(testUsers.client);

    const error = await rejectionOf(requireAdmin(args()));

    expect(error).toMatchObject({ init: { status: 403 } });
  });

  it("responde 403 si la sesión fue editada para parecer administrador", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ ...testUsers.client, role: "admin" }),
    );

    const error = await rejectionOf(requireAdmin(args()));

    expect(error).toMatchObject({ init: { status: 403 } });
  });

  it("responde 403 si el id de la sesión no coincide con el correo", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ ...testUsers.admin, email: "otro@correo.cl" }),
    );

    const error = await rejectionOf(requireAdmin(args()));

    expect(error).toMatchObject({ init: { status: 403 } });
  });

  it("devuelve la sesión si el usuario es administrador", async () => {
    login(testUsers.admin);

    await expect(requireAdmin(args())).resolves.toMatchObject({
      email: testUsers.admin.email,
      role: "admin",
    });
  });
});
