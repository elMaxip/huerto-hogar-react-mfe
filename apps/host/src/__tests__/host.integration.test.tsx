import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getCart, login, priceFormat } from "@huerto/shared";
import { testUsers } from "@huerto/shared/testing";
import { routes } from "../router";
import { renderRoutes } from "../test/renderRoutes";

/**
 * Host + micro-frontends reales: las importaciones `shop/*`, `auth/*`,
 * `cart/*` y `admin/*` apuntan al código de cada remoto (ver vitest.config.ts).
 */

/** La navbar del host (la primera navegación; el footer tiene otras) */
async function navbar() {
  return within((await screen.findAllByRole("navigation"))[0]);
}

describe("host con los micro-frontends", () => {
  it("muestra el inicio de shop dentro del layout del host", async () => {
    renderRoutes(routes, "/");

    expect(
      await screen.findByRole("heading", { name: "Promociones" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "HuertoHogar", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("compra un producto: inicio → detalle (shop) → carrito (cart)", async () => {
    const { user, router } = renderRoutes(routes, "/");

    await user.click(await screen.findByRole("link", { name: /Manzanas Fuji/ }));

    const quantity = await screen.findByLabelText("Cantidad");
    await user.clear(quantity);
    await user.type(quantity, "2");
    await user.click(
      screen.getByRole("button", { name: "Añadir al carrito de compras" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Carrito de compras" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/cart");
    expect(screen.getByText("Manzanas Fuji")).toBeInTheDocument();
    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(
      priceFormat.format(2 * 960),
    );
    expect(getCart()).toEqual([{ productId: "FR001", quantity: 2 }]);
  });

  it("navega al catálogo filtrado desde la navbar y el footer", async () => {
    const { user } = renderRoutes(routes, "/");

    const nav = await navbar();
    await user.click(nav.getByRole("link", { name: "Catálogo" }));
    expect(
      await screen.findByText("Todos nuestros productos"),
    ).toBeInTheDocument();

    const footerShop = within(screen.getByRole("navigation", { name: "Tienda" }));
    await user.click(footerShop.getByRole("link", { name: "Frutas frescas" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Frutas frescas" }),
    ).toBeInTheDocument();
    expect(nav.getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("inicia sesión desde el menú de cuenta (auth) y entra al panel (admin)", async () => {
    const { user, router } = renderRoutes(routes, "/");

    await user.click(await screen.findByRole("button", { name: "Cuenta" }));
    const dialog = await screen.findByRole("dialog", { name: "Cuenta" });
    await user.click(
      await within(dialog).findByRole("link", { name: "Iniciar sesión" }),
    );

    // El login se muestra fuera del layout, sin navbar
    await user.type(
      await screen.findByLabelText("Correo electrónico"),
      testUsers.admin.email,
    );
    await user.type(screen.getByLabelText("Contraseña"), testUsers.admin.password);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    const nav = await navbar();
    await user.click(nav.getByRole("link", { name: "Administración" }));

    expect(await screen.findByText("7 de 7 productos")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/admin");

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    expect(
      await screen.findByText(testUsers.admin.email),
    ).toBeInTheDocument();
  });

  it("registra una cuenta desde el menú de cuenta (auth)", async () => {
    const { user, router } = renderRoutes(routes, "/");

    await user.click(await screen.findByRole("button", { name: "Cuenta" }));
    await user.click(
      await screen.findByRole("link", { name: "Registrar cuenta" }),
    );

    await user.type(
      await screen.findByLabelText("Nombre completo"),
      "Ana Pérez",
    );
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "secreta123");
    await user.type(screen.getByLabelText("Confirma tu contraseña"), "secreta123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(
      await screen.findByRole("button", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });

  it("pide iniciar sesión para entrar al panel y vuelve a él", async () => {
    const { user, router } = renderRoutes(routes, "/admin/products/new");

    await user.type(
      await screen.findByLabelText("Correo electrónico"),
      testUsers.admin.email,
    );
    expect(router.state.location.search).toBe(
      "?redirectTo=%2Fadmin%2Fproducts%2Fnew",
    );

    await user.type(screen.getByLabelText("Contraseña"), testUsers.admin.password);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(
      await screen.findByRole("heading", { name: "Nuevo producto" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/admin/products/new");
  });

  it("muestra acceso denegado a los clientes que entran al panel", async () => {
    login(testUsers.client);
    renderRoutes(routes, "/admin");

    expect(
      await screen.findByRole("heading", { name: "Acceso denegado" }),
    ).toBeInTheDocument();
    // El error queda dentro del layout: la navbar sigue disponible
    const nav = await navbar();
    expect(nav.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
  });

  it("muestra la página 404 para rutas desconocidas", async () => {
    renderRoutes(routes, "/blog");

    expect(
      await screen.findByText("No existe la página /blog"),
    ).toBeInTheDocument();
  });

  it("muestra 404 si el admin edita un producto que no existe", async () => {
    login(testUsers.admin);
    renderRoutes(routes, "/admin/products/XX999");

    expect(await screen.findByRole("heading", { name: "404" })).toBeInTheDocument();
  });
});
