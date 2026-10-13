import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import {
  addToCart,
  Category,
  getCart,
  priceFormat,
  type Product,
} from "@huerto/shared";
import CartItemRow from "./CartItemRow";

const miel: Product = {
  id: "PO001",
  name: "Miel Orgánica",
  category: Category.ProductoOrganico,
  price: 5000,
  discount: 10,
  unidadVenta: "por frasco de 500g",
  img: "miel-organica.webp",
  stock: 50,
  description: "Miel pura",
};

function renderRow(quantity = 2) {
  addToCart(miel.id, quantity);

  render(
    <MemoryRouter>
      <ul>
        <CartItemRow product={miel} quantity={quantity} />
      </ul>
    </MemoryRouter>,
  );

  return { user: userEvent.setup(), input: screen.getByLabelText("Cantidad") };
}

describe("CartItemRow", () => {
  it("muestra el producto con su precio unitario y subtotal", () => {
    renderRow(2);

    expect(screen.getByRole("img", { name: "Miel Orgánica" })).toHaveAttribute(
      "src",
      expect.stringMatching(/miel-organica\.webp$/),
    );
    expect(screen.getByText("Producto orgánico")).toBeInTheDocument();
    expect(
      screen.getByText(`${priceFormat.format(4500)} por frasco de 500g`),
    ).toBeInTheDocument();
    expect(screen.getByText(priceFormat.format(9000))).toBeInTheDocument();
    expect(screen.getByLabelText("Cantidad")).toHaveValue(2);
  });

  it("enlaza al detalle del producto", () => {
    renderRow();

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "/product/PO001");
    }
  });

  it("actualiza la cantidad en el carrito", async () => {
    const { user, input } = renderRow();

    await user.clear(input);
    await user.type(input, "7");

    expect(getCart()).toEqual([{ productId: "PO001", quantity: 7 }]);
  });

  it("no permite superar el stock", async () => {
    const { user, input } = renderRow();

    await user.clear(input);
    await user.type(input, "120");

    expect(input).toHaveValue(50);
    expect(getCart()).toEqual([{ productId: "PO001", quantity: 50 }]);
  });

  it("deja el campo vacío mientras se escribe y elimina el producto al salir", async () => {
    const { user, input } = renderRow();

    await user.clear(input);

    expect(input).toHaveValue(null);
    expect(getCart()).toEqual([{ productId: "PO001", quantity: 2 }]);

    await user.tab();

    expect(getCart()).toEqual([]);
  });

  it("elimina el producto con el botón", async () => {
    const { user } = renderRow();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(getCart()).toEqual([]);
  });
});
