import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  Category,
  findCategory,
  getFinalPrice,
  nextProductId,
  priceFormat,
  toCategorySlug,
} from "./product";

describe("getFinalPrice", () => {
  it("devuelve el precio original si no hay descuento", () => {
    expect(getFinalPrice({ price: 1200 })).toBe(1200);
    expect(getFinalPrice({ price: 1200, discount: 0 })).toBe(1200);
  });

  it("aplica el porcentaje de descuento", () => {
    expect(getFinalPrice({ price: 1200, discount: 20 })).toBe(960);
  });

  it("trunca los decimales del precio final", () => {
    // 999 * 0.65 = 649.35
    expect(getFinalPrice({ price: 999, discount: 35 })).toBe(649);
  });
});

describe("toCategorySlug", () => {
  it.each([
    [Category.FrutaFresca, "frutas-frescas"],
    [Category.VerduraOrganica, "verdura-organica"],
    [Category.ProductoOrganico, "producto-organico"],
    [Category.ProductoLacteo, "producto-lacteo"],
  ])("convierte %s en %s", (category, slug) => {
    expect(toCategorySlug(category)).toBe(slug);
  });
});

describe("findCategory", () => {
  it("encuentra la categoría a partir de su slug", () => {
    expect(findCategory("verdura-organica")).toBe(Category.VerduraOrganica);
  });

  it("ignora mayúsculas y tildes", () => {
    expect(findCategory("Producto Lácteo")).toBe(Category.ProductoLacteo);
  });

  it("devuelve undefined si la categoría no existe", () => {
    expect(findCategory("carnes")).toBeUndefined();
  });

  it("recupera todas las categorías desde su slug", () => {
    for (const category of CATEGORIES) {
      expect(findCategory(toCategorySlug(category))).toBe(category);
    }
  });
});

describe("nextProductId", () => {
  it("empieza en 001 si no hay productos de la categoría", () => {
    expect(nextProductId(Category.ProductoLacteo, [{ id: "FR001" }])).toBe(
      "PL001",
    );
  });

  it("usa el número más alto de la categoría", () => {
    const products = [{ id: "FR001" }, { id: "FR007" }, { id: "FR003" }];

    expect(nextProductId(Category.FrutaFresca, products)).toBe("FR008");
  });

  it("ignora los códigos que no terminan en un número", () => {
    const products = [{ id: "VR002" }, { id: "VRABC" }];

    expect(nextProductId(Category.VerduraOrganica, products)).toBe("VR003");
  });
});

describe("priceFormat", () => {
  it("formatea en pesos chilenos sin decimales", () => {
    expect(priceFormat.format(1200)).toMatch(/^\$\s?1\.200$/);
  });
});
