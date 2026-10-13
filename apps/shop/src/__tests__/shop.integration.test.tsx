import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { addToCart, getCart } from "@huerto/shared";
import * as catalog from "../routes/catalog";
import * as home from "../routes/home";
import * as product from "../routes/product";
import { renderRoutes } from "../test/renderRoutes";

/** Las mismas rutas que monta el host para la tienda */
const routes = [
  { path: "/", ...home },
  { path: "/catalog", ...catalog },
  { path: "/catalog/:category", ...catalog },
  { path: "/product/:productId", ...product },
  { path: "/cart", element: <h1>Carrito</h1> },
];

describe("navegación por la tienda", () => {
  it("va del inicio a una categoría, a un producto y al carrito", async () => {
    const { user, router } = renderRoutes(routes, "/");

    await user.click(
      await screen.findByRole("link", { name: /Verdura orgánica.*Ver productos/ }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Verdura orgánica" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/catalog/verdura-organica");
    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Zanahorias Orgánicas", "Espinacas Frescas", "Pimientos Tricolores"]);

    await user.click(screen.getByRole("link", { name: /Espinacas Frescas/ }));

    const quantity = await screen.findByLabelText("Cantidad");
    expect(screen.getByText("80 unidades disponibles")).toBeInTheDocument();

    await user.clear(quantity);
    await user.type(quantity, "2");
    await user.click(
      screen.getByRole("button", { name: "Añadir al carrito de compras" }),
    );

    expect(await screen.findByRole("heading", { name: "Carrito" })).toBeVisible();
    expect(getCart()).toEqual([{ productId: "VR002", quantity: 2 }]);
  });

  it("filtra el catálogo con los enlaces de categorías", async () => {
    const { user } = renderRoutes(routes, "/catalog");
    const filters = within(
      await screen.findByRole("navigation", { name: "Filtrar por categoría" }),
    );

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(7);

    await user.click(filters.getByRole("link", { name: "Producto lácteo" }));

    expect(
      await screen.findByText("No hay productos en esta categoría."),
    ).toBeInTheDocument();

    await user.click(filters.getByRole("link", { name: "Todas" }));

    expect(
      await screen.findByText("Todos nuestros productos"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(7);
  });

  it("suma al carrito si el producto ya estaba agregado", async () => {
    addToCart("FR001", 2);
    const { user } = renderRoutes(routes, "/product/FR001");

    await user.click(
      await screen.findByRole("button", { name: "Añadir al carrito de compras" }),
    );

    await screen.findByRole("heading", { name: "Carrito" });
    expect(getCart()).toEqual([{ productId: "FR001", quantity: 3 }]);
  });

  it("muestra un aviso para un producto inexistente", async () => {
    renderRoutes(routes, "/product/XX999");

    expect(
      await screen.findByText(/No encontramos este producto/),
    ).toBeInTheDocument();
  });
});
