import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role, type NewUser } from "../../models/user";
import { createFakeDatabase } from "../../test/fakeDatabase";
import { openDatabase } from "./db";
import { getUser, getUserById, register } from "./user";

vi.mock(import("./db"), async (importOriginal) => ({
  ...(await importOriginal()),
  openDatabase: vi.fn(),
}));

const ana: NewUser = {
  fullname: "Ana Pérez",
  email: "ana@correo.cl",
  password: "secreta123",
  role: Role.Client,
};

let db: ReturnType<typeof createFakeDatabase>;

beforeEach(() => {
  db = createFakeDatabase();
  vi.mocked(openDatabase).mockResolvedValue(db);
});

describe("servicio de usuarios", () => {
  it("registra un usuario y devuelve su id", async () => {
    const user = await register(ana);

    expect(user).toEqual({ ...ana, id: 1 });
  });

  it("busca un usuario por correo y por id", async () => {
    const { id } = await register(ana);

    await expect(getUser("ana@correo.cl")).resolves.toEqual({ ...ana, id });
    await expect(getUserById(id)).resolves.toEqual({ ...ana, id });
  });

  it("devuelve undefined si el usuario no existe", async () => {
    await expect(getUser("nadie@correo.cl")).resolves.toBeUndefined();
    await expect(getUserById(99)).resolves.toBeUndefined();
  });

  it("trata como clientes a los usuarios guardados sin rol", async () => {
    db.stores.users.rows.set(5, {
      id: 5,
      fullname: "Usuario antiguo",
      email: "antiguo@correo.cl",
      password: "12345678",
    });

    await expect(getUserById(5)).resolves.toMatchObject({
      role: Role.Client,
    });
  });
});
