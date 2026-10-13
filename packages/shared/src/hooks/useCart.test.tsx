import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { addToCart, clearCart } from "../services/cart";
import { useCart, useCartCount } from "./useCart";

describe("useCart", () => {
  it("lee el carrito guardado", () => {
    addToCart("FR001", 2);

    const { result } = renderHook(() => useCart());

    expect(result.current).toEqual([{ productId: "FR001", quantity: 2 }]);
  });

  it("se actualiza cuando cambia el carrito en la misma pestaña", () => {
    const { result } = renderHook(() => useCart());
    expect(result.current).toEqual([]);

    act(() => addToCart("FR002"));
    expect(result.current).toEqual([{ productId: "FR002", quantity: 1 }]);

    act(() => clearCart());
    expect(result.current).toEqual([]);
  });

  it("se actualiza cuando otra pestaña modifica el carrito", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      localStorage.setItem(
        "cart",
        JSON.stringify([{ productId: "VR001", quantity: 4 }]),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: "cart" }));
    });

    expect(result.current).toEqual([{ productId: "VR001", quantity: 4 }]);
  });

  it("mantiene la misma referencia si el carrito no cambió", () => {
    addToCart("FR001");
    const { result, rerender } = renderHook(() => useCart());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

describe("useCartCount", () => {
  it("cuenta la cantidad total de productos", () => {
    const { result } = renderHook(() => useCartCount());
    expect(result.current).toBe(0);

    act(() => {
      addToCart("FR001", 2);
      addToCart("FR002", 3);
    });

    expect(result.current).toBe(5);
  });
});
