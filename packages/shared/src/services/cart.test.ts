import { describe, expect, it, vi } from "vitest";
import {
  addToCart,
  CART_CHANGE_EVENT,
  clearCart,
  countItems,
  getCart,
  parseCart,
  removeFromCart,
  setQuantity,
} from "./cart";

describe("parseCart", () => {
  it("devuelve un carrito vacío si no hay nada guardado", () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("")).toEqual([]);
  });

  it("devuelve un carrito vacío si el JSON es inválido o no es un arreglo", () => {
    expect(parseCart("{no es json")).toEqual([]);
    expect(parseCart('{"productId":"FR001"}')).toEqual([]);
  });

  it("descarta los elementos con forma incorrecta", () => {
    const saved = JSON.stringify([
      { productId: "FR001", quantity: 2 },
      { productId: "FR002", quantity: 0 },
      { productId: "FR003", quantity: 1.5 },
      { productId: 4, quantity: 1 },
      { quantity: 1 },
      null,
    ]);

    expect(parseCart(saved)).toEqual([{ productId: "FR001", quantity: 2 }]);
  });
});

describe("operaciones del carrito", () => {
  it("agrega un producto nuevo con cantidad 1 por defecto", () => {
    addToCart("FR001");

    expect(getCart()).toEqual([{ productId: "FR001", quantity: 1 }]);
  });

  it("suma la cantidad si el producto ya está en el carrito", () => {
    addToCart("FR001", 2);
    addToCart("FR001", 3);

    expect(getCart()).toEqual([{ productId: "FR001", quantity: 5 }]);
  });

  it("ignora cantidades menores a 1", () => {
    addToCart("FR001", 0);

    expect(getCart()).toEqual([]);
  });

  it("cambia la cantidad de un producto", () => {
    addToCart("FR001", 2);
    setQuantity("FR001", 7);

    expect(getCart()).toEqual([{ productId: "FR001", quantity: 7 }]);
  });

  it("no agrega productos al cambiar la cantidad de uno que no está", () => {
    setQuantity("FR001", 3);

    expect(getCart()).toEqual([]);
  });

  it("elimina el producto si la cantidad nueva es menor a 1", () => {
    addToCart("FR001");
    addToCart("FR002");
    setQuantity("FR001", 0);

    expect(getCart()).toEqual([{ productId: "FR002", quantity: 1 }]);
  });

  it("no emite el evento si la cantidad no cambia", () => {
    addToCart("FR001", 2);
    const listener = vi.fn();
    window.addEventListener(CART_CHANGE_EVENT, listener);

    setQuantity("FR001", 2);

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(CART_CHANGE_EVENT, listener);
  });

  it("elimina un producto", () => {
    addToCart("FR001");
    addToCart("FR002");
    removeFromCart("FR001");

    expect(getCart()).toEqual([{ productId: "FR002", quantity: 1 }]);
  });

  it("vacía el carrito", () => {
    addToCart("FR001");
    clearCart();

    expect(getCart()).toEqual([]);
    expect(localStorage.getItem("cart")).toBeNull();
  });
});

describe("countItems", () => {
  it("suma las cantidades de todos los productos", () => {
    expect(countItems([])).toBe(0);
    expect(
      countItems([
        { productId: "FR001", quantity: 2 },
        { productId: "FR002", quantity: 3 },
      ]),
    ).toBe(5);
  });
});
