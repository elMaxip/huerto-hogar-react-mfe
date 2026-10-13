import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Category, type Product } from "@huerto/shared";
import { renderRoutes } from "../../test/renderRoutes";
import Products from "./Products";

const products: Product[] = [
  {
    id: "VR001",
    name: "Zanahorias Orgánicas",
    category: Category.VerduraOrganica,
    price: 900,
    unidadVenta: "por kilo",
    img: "",
    stock: 100,
    description: "Zanahorias crujientes",
  },
  {
    id: "FR001",
    name: "Manzanas Fuji",
    category: Category.FrutaFresca,
    price: 1200,
    unidadVenta: "por kilo",
    img: "",
    stock: 150,
    description: "Manzanas crujientes",
  },
];

function renderProducts(
  data: Product[] = products,
  action = vi.fn(async () => null),
) {
  const result = renderRoutes([
    { path: "/", Component: Products, loader: () => ({ products: data }), action },
  ]);

  return { ...result, action };
}

function rowNames() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1].textContent);
}

describe("Products", () => {
  it("lista los productos ordenados por código", async () => {
    renderProducts();

    expect(await screen.findByText("2 de 2 productos")).toBeInTheDocument();
    expect(rowNames()).toEqual(["FR001", "VR001"]);
  });

  it("filtra por código, nombre o categoría sin importar mayúsculas", async () => {
    const { user } = renderProducts();
    const search = await screen.findByRole("searchbox", {
      name: "Buscar productos",
    });

    await user.type(search, "zanahorias");
    expect(rowNames()).toEqual(["VR001"]);

    await user.clear(search);
    await user.type(search, "fr0");
    expect(rowNames()).toEqual(["FR001"]);

    await user.clear(search);
    await user.type(search, "FRUTAS");
    expect(rowNames()).toEqual(["FR001"]);
    expect(screen.getByText("1 de 2 productos")).toBeInTheDocument();
  });

  it("avisa si ningún producto coincide con la búsqueda", async () => {
    const { user } = renderProducts();

    await user.type(await screen.findByRole("searchbox"), "carne");

    expect(
      screen.getByText("Ningún producto coincide con la búsqueda."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("invita a crear el primer producto si no hay ninguno", async () => {
    renderProducts([]);

    expect(
      await screen.findByRole("link", { name: "Crea el primero" }),
    ).toHaveAttribute("href", "/admin/products/new");
  });

  it("pide confirmación antes de eliminar y permite cancelar", async () => {
    const { user, action } = renderProducts();

    const row = (await screen.findByText("Manzanas Fuji")).closest("tr")!;
    await user.click(within(row).getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar producto" });
    expect(dialog).toHaveTextContent("Se eliminará Manzanas Fuji (FR001)");

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("cierra la confirmación con Escape sin eliminar", async () => {
    const { user, action } = renderProducts();

    const row = (await screen.findByText("Manzanas Fuji")).closest("tr")!;
    await user.click(within(row).getByRole("button", { name: "Eliminar" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("envía el producto a eliminar a la action de la ruta", async () => {
    const { user, action } = renderProducts();

    const row = (await screen.findByText("Manzanas Fuji")).closest("tr")!;
    await user.click(within(row).getByRole("button", { name: "Eliminar" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Eliminar",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());

    const [{ request }] = action.mock.calls[0] as unknown as [
      { request: Request },
    ];
    const formData = await request.formData();

    expect(Object.fromEntries(formData)).toEqual({
      intent: "delete",
      productId: "FR001",
    });
  });
});
