import { screen, within } from "@testing-library/react";
import {
  isRouteErrorResponse,
  useLocation,
  useRouteError,
  type RouteObject,
} from "react-router";
import { describe, expect, it } from "vitest";
import { login } from "@huerto/shared";
import { getMemoryData, testUsers } from "@huerto/shared/testing";
import * as layout from "../routes/layout";
import * as products from "../routes/products";
import * as productForm from "../routes/productForm";
import { renderRoutes } from "../test/renderRoutes";

function CurrentUrl() {
  const { pathname, search } = useLocation();

  return <p>URL: {pathname + search}</p>;
}

function ErrorPage() {
  const error = useRouteError();

  return <p>Error {isRouteErrorResponse(error) ? error.status : "?"}</p>;
}

/** Las mismas rutas que monta el host para el panel */
const routes: RouteObject[] = [
  {
    path: "/admin",
    ...layout,
    ErrorBoundary: ErrorPage,
    children: [
      { index: true, ...products },
      { path: "products/new", ...productForm },
      { path: "products/:productId", ...productForm },
    ],
  },
  { path: "*", Component: CurrentUrl },
];

function rowOf(productName: string) {
  return within(screen.getByText(productName).closest("tr")!);
}

describe("panel de administración", () => {
  it("redirige al login sin sesión", async () => {
    renderRoutes(routes, "/admin/products/new");

    expect(
      await screen.findByText("URL: /login?redirectTo=%2Fadmin%2Fproducts%2Fnew"),
    ).toBeInTheDocument();
  });

  it("niega el acceso a los clientes", async () => {
    login(testUsers.client);
    renderRoutes(routes, "/admin");

    expect(await screen.findByText("Error 403")).toBeInTheDocument();
  });

  it("responde 404 al editar un producto inexistente", async () => {
    login(testUsers.admin);
    renderRoutes(routes, "/admin/products/XX999");

    expect(await screen.findByText("Error 404")).toBeInTheDocument();
  });

  it("lista los productos de la base de datos", async () => {
    login(testUsers.admin);
    renderRoutes(routes, "/admin");

    expect(await screen.findByText("7 de 7 productos")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(8);
  });

  it("elimina un producto después de confirmar", async () => {
    login(testUsers.admin);
    const { user } = renderRoutes(routes, "/admin");

    await screen.findByText("Miel Orgánica");
    await user.click(rowOf("Miel Orgánica").getByRole("button", { name: "Eliminar" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Eliminar",
      }),
    );

    expect(await screen.findByText("6 de 6 productos")).toBeInTheDocument();
    expect(screen.queryByText("Miel Orgánica")).not.toBeInTheDocument();
    expect(getMemoryData().products.map(({ id }) => id)).not.toContain(
      "PO001",
    );
  });

  it("crea un producto y vuelve al listado", async () => {
    login(testUsers.admin);
    const { user, router } = renderRoutes(routes, "/admin");

    await user.click(await screen.findByRole("link", { name: "Nuevo producto" }));
    await user.type(await screen.findByLabelText("Nombre"), "Leche Entera");
    await user.selectOptions(
      screen.getByLabelText("Categoría"),
      "Producto lácteo",
    );
    await user.type(screen.getByLabelText("Precio (CLP)"), "1100");
    await user.type(screen.getByLabelText("Stock"), "40");
    await user.type(
      screen.getByLabelText("Descripción"),
      "Leche entera de libre pastoreo.",
    );
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByText("8 de 8 productos")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/admin");
    expect(rowOf("Leche Entera").getByText("PL001")).toBeInTheDocument();
  });

  it("edita un producto existente", async () => {
    login(testUsers.admin);
    const { user } = renderRoutes(routes, "/admin");

    await screen.findByText("Naranjas Valencia");
    await user.click(rowOf("Naranjas Valencia").getByRole("link", { name: "Editar" }));

    const stock = await screen.findByLabelText("Stock");
    expect(stock).toHaveValue(200);

    await user.clear(stock);
    await user.type(stock, "0");
    await user.clear(screen.getByLabelText("Descuento (%)"));
    await user.type(screen.getByLabelText("Descuento (%)"), "50");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await screen.findByText("7 de 7 productos");
    const row = rowOf("Naranjas Valencia");

    expect(row.getByRole("cell", { name: "0" })).toHaveClass("outOfStock");
    expect(row.getByRole("cell", { name: "50%" })).toBeInTheDocument();
    expect(
      getMemoryData().products.find(({ id }) => id === "FR002"),
    ).toMatchObject({ stock: 0, discount: 50 });
  });
});
