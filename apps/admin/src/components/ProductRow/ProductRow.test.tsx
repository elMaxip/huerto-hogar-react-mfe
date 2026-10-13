import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Category, type Product } from "@huerto/shared";
import ProductRow from "./ProductRow";

const product: Product = {
  id: "FR001",
  name: "Manzanas Fuji",
  category: Category.FrutaFresca,
  price: 1200,
  discount: 20,
  unidadVenta: "por kilo",
  img: "manzanas-fuji.webp",
  stock: 150,
  description: "Manzanas crujientes",
};

function renderRow(overrides: Partial<Product> = {}, onDelete = vi.fn()) {
  render(
    <MemoryRouter>
      <table>
        <tbody>
          <ProductRow product={{ ...product, ...overrides }} onDelete={onDelete} />
        </tbody>
      </table>
    </MemoryRouter>,
  );

  return within(screen.getByRole("row"));
}

describe("ProductRow", () => {
  it("muestra los datos del producto", () => {
    const row = renderRow();

    expect(row.getByRole("cell", { name: "FR001" })).toBeInTheDocument();
    expect(row.getByRole("cell", { name: "Frutas frescas" })).toBeInTheDocument();
    expect(row.getByRole("cell", { name: "20%" })).toBeInTheDocument();
    expect(row.getByRole("cell", { name: "150" })).not.toHaveClass("outOfStock");
  });

  it("muestra el precio original tachado y el precio con descuento", () => {
    const row = renderRow();

    expect(row.getByText(/1\.200/)).toHaveClass("oldPrice");
    expect(row.getByText(/1\.200/).parentElement).toHaveTextContent(/960/);
  });

  it("muestra un guion si no hay descuento", () => {
    const row = renderRow({ discount: undefined });

    expect(row.getByRole("cell", { name: "—" })).toBeInTheDocument();
    expect(row.queryByText(/960/)).not.toBeInTheDocument();
  });

  it("marca los productos sin stock", () => {
    const row = renderRow({ stock: 0 });

    expect(row.getByRole("cell", { name: "0" })).toHaveClass("outOfStock");
  });

  it("enlaza al detalle y a la edición del producto", () => {
    const row = renderRow();

    expect(row.getByRole("link", { name: "Manzanas Fuji" })).toHaveAttribute(
      "href",
      "/product/FR001",
    );
    expect(row.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      "/admin/products/FR001",
    );
  });

  it("llama a onDelete al pulsar Eliminar", async () => {
    const onDelete = vi.fn();
    const row = renderRow({}, onDelete);

    await userEvent.click(row.getByRole("button", { name: "Eliminar" }));

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
