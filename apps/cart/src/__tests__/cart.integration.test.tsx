import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { addToCart, getCart, priceFormat } from "@huerto/shared";
import * as cart from "../routes/cart";
import { renderRoutes } from "../test/renderRoutes";

function total() {
  return screen.getByText("Total").nextElementSibling;
}

function itemOf(name: string) {
  return within(screen.getByText(name).closest("li")!);
}

describe("carrito con los datos de la tienda", () => {
  it("ajusta las cantidades al stock al entrar al carrito", async () => {
    // La miel orgánica (PO001, 4.500 con descuento) tiene 50 unidades
    addToCart("PO001", 70);
    renderRoutes([{ path: "/cart", ...cart }], "/cart");

    expect(await screen.findByLabelText("Cantidad")).toHaveValue(50);
    expect(total()).toHaveTextContent(priceFormat.format(50 * 4500));
    expect(getCart()).toEqual([{ productId: "PO001", quantity: 50 }]);
  });

  it("modifica, elimina y compra los productos del carrito", async () => {
    addToCart("FR001", 1); // Manzanas Fuji: 960 con descuento
    addToCart("VR001", 2); // Zanahorias Orgánicas: 585 con descuento
    addToCart("FR003", 1); // Plátanos Cavendish: 800
    const { user } = renderRoutes([{ path: "/cart", ...cart }], "/cart");

    await screen.findByText("Manzanas Fuji");
    expect(total()).toHaveTextContent(priceFormat.format(960 + 2 * 585 + 800));

    const manzanas = itemOf("Manzanas Fuji").getByLabelText("Cantidad");
    await user.clear(manzanas);
    await user.type(manzanas, "3");
    expect(total()).toHaveTextContent(priceFormat.format(3 * 960 + 2 * 585 + 800));

    await user.click(
      itemOf("Plátanos Cavendish").getByRole("button", { name: "Eliminar" }),
    );
    expect(screen.queryByText("Plátanos Cavendish")).not.toBeInTheDocument();
    expect(total()).toHaveTextContent(priceFormat.format(3 * 960 + 2 * 585));

    expect(getCart()).toEqual([
      { productId: "FR001", quantity: 3 },
      { productId: "VR001", quantity: 2 },
    ]);

    await user.click(screen.getByRole("button", { name: "Comprar productos" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "¡Gracias por tu compra!",
    );
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(getCart()).toEqual([]);
  });
});
