import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  addToCart,
  Category,
  getCart,
  priceFormat,
  type Product,
} from "@huerto/shared";
import { renderRoutes } from "../../test/renderRoutes";
import Cart from "./Cart";

const products: Product[] = [
  {
    id: "FR001",
    name: "Manzanas Fuji",
    category: Category.FrutaFresca,
    price: 1200,
    discount: 20,
    unidadVenta: "por kilo",
    img: "",
    stock: 150,
    description: "Manzanas",
  },
  {
    id: "FR002",
    name: "Naranjas Valencia",
    category: Category.FrutaFresca,
    price: 1000,
    unidadVenta: "por kilo",
    img: "",
    stock: 200,
    description: "Naranjas",
  },
];

function renderCart() {
  return renderRoutes([
    { path: "/", Component: Cart, loader: () => ({ products }) },
  ]);
}

describe("Cart", () => {
  it("muestra un mensaje si el carrito está vacío", async () => {
    renderCart();

    expect(
      await screen.findByText(/Tu carrito está vacío/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver productos" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.queryByRole("button", { name: "Eliminar carrito" }),
    ).not.toBeInTheDocument();
  });

  it("lista los productos y calcula el total con descuentos", async () => {
    addToCart("FR001", 2); // 2 x 960
    addToCart("FR002", 3); // 3 x 1000
    renderCart();

    const items = await screen.findAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Manzanas Fuji")).toBeInTheDocument();
    expect(within(items[1]).getByText("Naranjas Valencia")).toBeInTheDocument();
    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(
      priceFormat.format(4920),
    );
  });

  it("ignora los productos del carrito que ya no existen", async () => {
    addToCart("XX999");
    addToCart("FR002");
    renderCart();

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
  });

  it("recalcula el total al cambiar una cantidad", async () => {
    addToCart("FR002", 1);
    const { user } = renderCart();

    const input = await screen.findByLabelText("Cantidad");
    await user.clear(input);
    await user.type(input, "4");

    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(
      priceFormat.format(4000),
    );
  });

  it("vacía el carrito", async () => {
    addToCart("FR001");
    const { user } = renderCart();

    await user.click(
      await screen.findByRole("button", { name: "Eliminar carrito" }),
    );

    expect(screen.getByText(/Tu carrito está vacío/)).toBeInTheDocument();
    expect(getCart()).toEqual([]);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("simula la compra y agradece al cliente", async () => {
    addToCart("FR001");
    const { user } = renderCart();

    await user.click(
      await screen.findByRole("button", { name: "Comprar productos" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "¡Gracias por tu compra! Tu carrito quedó vacío.",
    );
    expect(getCart()).toEqual([]);
  });

  it("se actualiza si el carrito cambia en otra pestaña", async () => {
    renderCart();
    await screen.findByText(/Tu carrito está vacío/);

    act(() => {
      localStorage.setItem(
        "cart",
        JSON.stringify([{ productId: "FR002", quantity: 2 }]),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: "cart" }));
    });

    expect(screen.getByText("Naranjas Valencia")).toBeInTheDocument();
  });
});
