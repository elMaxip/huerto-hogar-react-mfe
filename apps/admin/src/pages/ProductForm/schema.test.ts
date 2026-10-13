import { describe, expect, it } from "vitest";
import { Category } from "@huerto/shared";
import { productFormSchema, productPayloadSchema } from "./schema";

const valid = {
  name: "Leche Entera",
  category: Category.ProductoLacteo,
  price: 1100,
  discount: 0,
  stock: 40,
  unidadVenta: "por litro",
  description: "Leche entera de vacas de libre pastoreo.",
};

function errorsOf(values: unknown) {
  const result = productFormSchema.safeParse(values);

  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      );
}

describe("productFormSchema", () => {
  it("acepta un producto válido y recorta los espacios", () => {
    const result = productFormSchema.parse({
      ...valid,
      name: "  Leche Entera  ",
    });

    expect(result.name).toBe("Leche Entera");
  });

  it.each([
    ["name", "Le", "El nombre debe tener al menos 3 caracteres"],
    ["name", "x".repeat(81), "El nombre puede tener como máximo 80 caracteres"],
    ["category", "Carnes", "Selecciona una categoría"],
    ["price", 0, "El precio debe ser mayor a 0"],
    ["price", 10.5, "El precio debe ser un número entero"],
    ["price", Number.NaN, "Ingresa un precio"],
    ["discount", -1, "El descuento no puede ser negativo"],
    ["discount", 91, "El descuento puede ser como máximo 90%"],
    ["stock", -5, "El stock no puede ser negativo"],
    ["unidadVenta", "   ", "Ingresa la unidad de venta"],
    ["description", "corta", "La descripción debe tener al menos 10 caracteres"],
  ])("rechaza %s = %j", (field, value, message) => {
    expect(errorsOf({ ...valid, [field]: value })).toEqual({
      [field]: message,
    });
  });
});

describe("productPayloadSchema", () => {
  it("exige la imagen además de los datos del formulario", () => {
    expect(productPayloadSchema.safeParse(valid).success).toBe(false);
    expect(productPayloadSchema.safeParse({ ...valid, img: "" }).success).toBe(
      true,
    );
  });
});
