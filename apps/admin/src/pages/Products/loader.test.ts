import { beforeEach, describe, expect, it } from "vitest";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { deleteProduct, login } from "@huerto/shared";
import { getMemoryData, testUsers } from "@huerto/shared/testing";
import { productsAction, productsLoader } from "./loader";

function loaderArgs() {
  return {
    request: new Request("http://localhost/admin"),
    params: {},
  } as LoaderFunctionArgs;
}

function actionArgs(body: Record<string, string>) {
  return {
    request: new Request("http://localhost/admin", {
      method: "POST",
      body: new URLSearchParams(body),
    }),
    params: {},
  } as ActionFunctionArgs;
}

describe("productsLoader", () => {
  it("exige una sesión de administrador", async () => {
    await expect(productsLoader(loaderArgs())).rejects.toBeInstanceOf(
      Response,
    );
  });

  it("devuelve todos los productos", async () => {
    login(testUsers.admin);

    const { products } = await productsLoader(loaderArgs());

    expect(products).toEqual(getMemoryData().products);
  });
});

describe("productsAction", () => {
  beforeEach(() => login(testUsers.admin));

  it("elimina el producto indicado", async () => {
    await productsAction(actionArgs({ intent: "delete", productId: "FR001" }));

    expect(deleteProduct).toHaveBeenCalledWith("FR001");
    expect(getMemoryData().products.map(({ id }) => id)).not.toContain(
      "FR001",
    );
  });

  it("ignora otros intents", async () => {
    await productsAction(actionArgs({ intent: "otro", productId: "FR001" }));

    expect(deleteProduct).not.toHaveBeenCalled();
  });

  it("no elimina nada si el usuario no es administrador", async () => {
    login(testUsers.client);

    await expect(
      productsAction(actionArgs({ intent: "delete", productId: "FR001" })),
    ).rejects.toMatchObject({ init: { status: 403 } });
    expect(deleteProduct).not.toHaveBeenCalled();
  });
});
