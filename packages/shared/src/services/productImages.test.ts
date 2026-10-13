import { describe, expect, it } from "vitest";
import { getProductImage } from "./productImages";

describe("getProductImage", () => {
  it("devuelve la URL de una imagen incluida en el paquete", () => {
    expect(getProductImage({ img: "miel-organica.webp" })).toMatch(
      /miel-organica\.webp$/,
    );
  });

  it("usa una imagen por defecto si el producto no tiene imagen", () => {
    expect(getProductImage({ img: "" })).toMatch(/manzanas-fuji\.webp$/);
  });

  it("devuelve tal cual las imágenes externas o subidas", () => {
    const dataUrl = "data:image/png;base64,AAAA";

    expect(getProductImage({ img: dataUrl })).toBe(dataUrl);
  });
});
