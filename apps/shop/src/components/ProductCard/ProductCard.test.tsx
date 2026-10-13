import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { Category, priceFormat, type Product } from "@huerto/shared";
import ProductCard from "./ProductCard";

const zanahorias: Product = {
  id: "VR001",
  name: "Zanahorias Orgánicas",
  category: Category.VerduraOrganica,
  price: 900,
  discount: 35,
  unidadVenta: "por kilo",
  img: "zanahorias-organicas.webp",
  stock: 100,
  description: "Zanahorias crujientes",
};

function renderCard(product: Product) {
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );

  return screen.getByRole("link");
}

describe("ProductCard", () => {
  it("muestra el producto con su descuento", () => {
    const link = renderCard(zanahorias);

    expect(link).toHaveAttribute("href", "/product/VR001");
    expect(link).toHaveAttribute("data-discount", "true");
    expect(
      screen.getByRole("heading", { name: "Zanahorias Orgánicas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Verdura orgánica")).toBeInTheDocument();
    expect(screen.getByText("35% OFF")).toBeInTheDocument();
    expect(screen.getByText(priceFormat.format(900))).toHaveClass("price");
    expect(screen.getByText(priceFormat.format(585))).toHaveClass(
      "discountPrice",
    );
    expect(
      screen.getByRole("img", { name: "Zanahorias Orgánicas" }),
    ).toHaveAttribute("src", expect.stringMatching(/zanahorias-organicas\.webp$/));
  });

  it("no muestra la etiqueta ni el precio rebajado sin descuento", () => {
    const link = renderCard({ ...zanahorias, discount: undefined });

    expect(link).toHaveAttribute("data-discount", "false");
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument();
    expect(screen.queryByText(priceFormat.format(585))).not.toBeInTheDocument();
  });

  it("codifica el código del producto en la URL", () => {
    const link = renderCard({ ...zanahorias, id: "VR 01/x" });

    expect(link).toHaveAttribute("href", "/product/VR%2001%2Fx");
  });
});
