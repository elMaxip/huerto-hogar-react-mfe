import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Category,
  getCart,
  priceFormat,
  type Product as ProductModel,
} from "@huerto/shared";
import { renderRoutes } from "../../test/renderRoutes";
import Product from "./Product";

const miel: ProductModel = {
  id: "PO001",
  name: "Miel Orgánica",
  category: Category.ProductoOrganico,
  price: 5000,
  discount: 10,
  unidadVenta: "por frasco de 500g",
  img: "miel-organica.webp",
  stock: 50,
  description: "Miel pura y orgánica producida por apicultores locales.",
};

function renderProduct(product: ProductModel | undefined) {
  return renderRoutes(
    [
      { path: "/product/:productId", Component: Product, loader: () => ({ product }) },
      { path: "/cart", element: <h1>Carrito</h1> },
      { path: "/", element: <h1>Inicio</h1> },
    ],
    "/product/PO001",
  );
}

describe("Product", () => {
  it("avisa si el producto no existe", async () => {
    const { user } = renderProduct(undefined);

    expect(
      await screen.findByText(/No encontramos este producto/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));

    expect(screen.getByRole("heading", { name: "Inicio" })).toBeInTheDocument();
  });

  it("muestra el detalle del producto", async () => {
    renderProduct(miel);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Miel Orgánica" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Producto orgánico")).toBeInTheDocument();
    expect(screen.getByText("10% OFF")).toBeInTheDocument();
    expect(screen.getByText(priceFormat.format(5000))).toBeInTheDocument();
    expect(screen.getByText(priceFormat.format(4500))).toBeInTheDocument();
    expect(screen.getByText("por frasco de 500g")).toBeInTheDocument();
    expect(screen.getByText(miel.description)).toBeInTheDocument();
    expect(screen.getByText("50 unidades disponibles")).toBeInTheDocument();
    expect(screen.getByLabelText("Cantidad")).toHaveValue(1);
  });

  it("no permite comprar productos sin stock", async () => {
    renderProduct({ ...miel, stock: 0 });

    expect(await screen.findByText("Sin stock")).toHaveClass("outOfStock");
    expect(screen.getByLabelText("Cantidad")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Añadir al carrito de compras" }),
    ).toBeDisabled();
  });

  it("agrega la cantidad elegida al carrito y va al carrito", async () => {
    const { user, router } = renderProduct(miel);

    const quantity = await screen.findByLabelText("Cantidad");
    await user.clear(quantity);
    await user.type(quantity, "3");
    await user.click(
      screen.getByRole("button", { name: "Añadir al carrito de compras" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Carrito" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/cart");
    expect(getCart()).toEqual([{ productId: "PO001", quantity: 3 }]);
  });

  it.each([
    ["999", 50],
    ["0", 1],
    ["", 1],
    ["2.7", 2],
  ])("ajusta la cantidad %j a %i", async (typed, expected) => {
    const { user } = renderProduct(miel);

    const quantity = await screen.findByLabelText("Cantidad");
    await user.clear(quantity);
    if (typed) await user.type(quantity, typed);
    await user.click(
      screen.getByRole("button", { name: "Añadir al carrito de compras" }),
    );

    await screen.findByRole("heading", { name: "Carrito" });
    expect(getCart()).toEqual([{ productId: "PO001", quantity: expected }]);
  });
});
