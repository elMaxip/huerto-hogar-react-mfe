import { describe, expect, it } from "vitest";
import { addToCart, getCart } from "@huerto/shared";
import { getMemoryData } from "@huerto/shared/testing";
import { cartLoader } from "./loader";

describe("cartLoader", () => {
  it("devuelve todos los productos", async () => {
    await expect(cartLoader()).resolves.toEqual({
      products: getMemoryData().products,
    });
  });

  it("ajusta al stock las cantidades que lo superan", async () => {
    // La miel orgánica (PO001) tiene 50 unidades
    addToCart("PO001", 80);
    addToCart("FR001", 3);

    await cartLoader();

    expect(getCart()).toEqual([
      { productId: "PO001", quantity: 50 },
      { productId: "FR001", quantity: 3 },
    ]);
  });

  it("no toca los productos del carrito que ya no existen", async () => {
    addToCart("XX999", 4);

    await cartLoader();

    expect(getCart()).toEqual([{ productId: "XX999", quantity: 4 }]);
  });
});
