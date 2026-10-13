import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Category, createProduct, login } from "@huerto/shared";
import { getMemoryData, testUsers } from "@huerto/shared/testing";
import { productFormAction, productFormLoader } from "./loader";

const payload = {
  name: "Leche Entera",
  category: Category.ProductoLacteo,
  price: 1100,
  discount: 0,
  stock: 40,
  unidadVenta: "por litro",
  description: "Leche entera de vacas de libre pastoreo.",
  img: "",
};

function loaderArgs(productId?: string) {
  return {
    request: new Request("http://localhost/admin/products/x"),
    params: productId ? { productId } : {},
  } as LoaderFunctionArgs;
}

function actionArgs(body: unknown, productId?: string) {
  return {
    request: new Request("http://localhost/admin/products/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    params: productId ? { productId } : {},
  } as ActionFunctionArgs;
}

function findProduct(id: string) {
  return getMemoryData().products.find((product) => product.id === id);
}

beforeEach(() => login(testUsers.admin));

describe("productFormLoader", () => {
  it("no carga producto al crear uno nuevo", async () => {
    await expect(productFormLoader(loaderArgs())).resolves.toEqual({
      product: undefined,
    });
  });

  it("carga el producto a editar", async () => {
    const { product } = await productFormLoader(loaderArgs("VR002"));

    expect(product).toMatchObject({ id: "VR002", name: "Espinacas Frescas" });
  });

  it("responde 404 si el producto no existe", async () => {
    await expect(productFormLoader(loaderArgs("XX999"))).rejects.toMatchObject(
      { init: { status: 404 } },
    );
  });
});

describe("productFormAction", () => {
  it("crea el producto con el siguiente código de su categoría", async () => {
    const response = await productFormAction(actionArgs(payload));

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).headers.get("Location")).toBe("/admin");
    expect(findProduct("PL001")).toMatchObject({
      name: "Leche Entera",
      discount: undefined,
    });
  });

  it("guarda el descuento solo si es mayor a 0", async () => {
    await productFormAction(
      actionArgs({ ...payload, category: Category.FrutaFresca, discount: 15 }),
    );

    expect(findProduct("FR004")).toMatchObject({ discount: 15 });
  });

  it("actualiza un producto existente sin cambiar su código", async () => {
    await productFormAction(actionArgs({ ...payload, stock: 3 }, "FR002"));

    expect(findProduct("FR002")).toMatchObject({
      name: "Leche Entera",
      stock: 3,
    });
    expect(findProduct("PL001")).toBeUndefined();
  });

  it("devuelve un error si los datos no son válidos", async () => {
    await expect(
      productFormAction(actionArgs({ ...payload, price: -1 })),
    ).resolves.toEqual({ error: "Los datos del producto no son válidos" });
    expect(createProduct).not.toHaveBeenCalled();
  });

  it("responde 404 al editar un producto que no existe", async () => {
    await expect(
      productFormAction(actionArgs(payload, "XX999")),
    ).rejects.toMatchObject({ init: { status: 404 } });
  });

  it("devuelve un error si no se pudo guardar", async () => {
    vi.mocked(createProduct).mockRejectedValueOnce(new Error("disco"));

    await expect(productFormAction(actionArgs(payload))).resolves.toEqual({
      error: "No se pudo guardar el producto, intenta nuevamente",
    });
  });

  it("exige una sesión de administrador", async () => {
    login(testUsers.client);

    await expect(productFormAction(actionArgs(payload))).rejects.toMatchObject(
      { init: { status: 403 } },
    );
    expect(createProduct).not.toHaveBeenCalled();
  });
});
