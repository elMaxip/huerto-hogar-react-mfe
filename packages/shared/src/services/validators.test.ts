import { describe, expect, it } from "vitest";
import { isValidEmail } from "./validators";

describe("isValidEmail", () => {
  it.each(["cliente@huertohogar.cl", "nombre.apellido+tag@dominio.co"])(
    "acepta %s",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(["", "sin-arroba.cl", "a@b", "a@b.c", "con espacio@correo.cl"])(
    "rechaza %j",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});
