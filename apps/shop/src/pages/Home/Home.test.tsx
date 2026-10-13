import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getMemoryData } from "@huerto/shared/testing";
import { renderRoutes } from "../../test/renderRoutes";
import Home from "./Home";

function section(heading: string) {
  return within(screen.getByRole("heading", { name: heading }).closest("article")!);
}

function renderHome() {
  return renderRoutes([
    {
      path: "/",
      Component: Home,
      loader: () => ({ products: getMemoryData().products }),
    },
  ]);
}

describe("Home", () => {
  it("separa los productos con descuento en Promociones", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Promociones" });

    const promotions = section("Promociones")
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(promotions).toEqual([
      "Manzanas Fuji",
      "Zanahorias Orgánicas",
      "Miel Orgánica",
    ]);
  });

  it("muestra el resto en Productos destacados", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Productos destacados" });

    const featured = section("Productos destacados").getAllByRole("link");

    expect(featured).toHaveLength(4);
    expect(section("Productos destacados").queryByText(/OFF/)).toBeNull();
  });

  it("muestra una tarjeta por categoría", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Categorías" });

    const links = section("Categorías").getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/catalog/frutas-frescas",
      "/catalog/verdura-organica",
      "/catalog/producto-organico",
      "/catalog/producto-lacteo",
    ]);
    expect(
      section("Categorías").getByText(
        "Cultivadas sin pesticidas por productores locales.",
      ),
    ).toBeInTheDocument();
  });
});
