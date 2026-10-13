import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Category, type Product } from "@huerto/shared";
import { getMemoryData } from "@huerto/shared/testing";
import { renderRoutes } from "../../test/renderRoutes";
import Catalog from "./Catalog";
import type { CatalogData } from "./loader";

function renderCatalog(data: CatalogData, url = "/catalog") {
  return renderRoutes(
    [
      { path: "/catalog", Component: Catalog, loader: () => data },
      { path: "/catalog/:category", Component: Catalog, loader: () => data },
    ],
    url,
  );
}

const all: Product[] = getMemoryData().products;

describe("Catalog", () => {
  it("muestra todos los productos sin filtro", async () => {
    renderCatalog({ slug: undefined, category: undefined, products: all });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Catálogo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Todos nuestros productos")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(7);
  });

  it("muestra el nombre de la categoría filtrada", async () => {
    renderCatalog(
      {
        slug: "producto-organico",
        category: Category.ProductoOrganico,
        products: all.filter(
          ({ category }) => category === Category.ProductoOrganico,
        ),
      },
      "/catalog/producto-organico",
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Producto orgánico" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Productos de esta categoría")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Miel Orgánica" }),
    ).toBeInTheDocument();
  });

  it("avisa si la categoría no existe o no tiene productos", async () => {
    renderCatalog(
      { slug: "carnes", category: undefined, products: [] },
      "/catalog/carnes",
    );

    expect(
      await screen.findByText('No existe la categoría "carnes"'),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No hay productos en esta categoría."),
    ).toBeInTheDocument();
  });

  it("marca el filtro activo", async () => {
    renderCatalog(
      { slug: "frutas-frescas", category: Category.FrutaFresca, products: [] },
      "/catalog/frutas-frescas",
    );

    const filters = within(
      await screen.findByRole("navigation", { name: "Filtrar por categoría" }),
    );

    expect(filters.getAllByRole("link")).toHaveLength(5);
    expect(filters.getByRole("link", { name: "Frutas frescas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(filters.getByRole("link", { name: "Todas" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
