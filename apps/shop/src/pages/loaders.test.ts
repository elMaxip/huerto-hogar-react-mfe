import { describe, expect, it } from "vitest";
import type { LoaderFunctionArgs } from "react-router";
import {
  getProduct,
  getProducts,
  getProductsByCategory,
} from "@huerto/shared";
import { getMemoryData } from "@huerto/shared/testing";
import { catalogLoader } from "./Catalog/loader";
import { homeLoader } from "./Home/loader";
import { productLoader } from "./Product/loader";

function args(params: Record<string, string> = {}) {
  return {
    request: new Request("http://localhost/"),
    params,
  } as LoaderFunctionArgs;
}

describe("homeLoader", () => {
  it("carga todos los productos", async () => {
    await expect(homeLoader()).resolves.toEqual({
      products: getMemoryData().products,
    });
  });
});

describe("catalogLoader", () => {
  it("carga todos los productos sin categoría", async () => {
    const data = await catalogLoader(args());

    expect(data).toEqual({
      slug: undefined,
      category: undefined,
      products: getMemoryData().products,
    });
  });

  it("filtra por la categoría del slug", async () => {
    const data = await catalogLoader(args({ category: "verdura-organica" }));

    expect(data.category).toBe("Verdura orgánica");
    expect(data.products.map(({ id }) => id)).toEqual([
      "VR001",
      "VR002",
      "VR003",
    ]);
    expect(getProductsByCategory).toHaveBeenCalledWith("Verdura orgánica");
  });

  it("no consulta la base de datos si la categoría no existe", async () => {
    const data = await catalogLoader(args({ category: "carnes" }));

    expect(data).toEqual({ slug: "carnes", category: undefined, products: [] });
    expect(getProducts).not.toHaveBeenCalled();
    expect(getProductsByCategory).not.toHaveBeenCalled();
  });
});

describe("productLoader", () => {
  it("carga el producto pedido", async () => {
    const { product } = await productLoader(args({ productId: "PO001" }));

    expect(product?.name).toBe("Miel Orgánica");
  });

  it("no consulta la base de datos sin código de producto", async () => {
    await expect(productLoader(args())).resolves.toEqual({
      product: undefined,
    });
    expect(getProduct).not.toHaveBeenCalled();
  });

  it("devuelve undefined si el producto no existe", async () => {
    await expect(productLoader(args({ productId: "XX999" }))).resolves.toEqual(
      { product: undefined },
    );
  });
});
