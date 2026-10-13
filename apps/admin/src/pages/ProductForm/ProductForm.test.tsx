import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ActionFunctionArgs } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Category, type Product } from "@huerto/shared";
import { renderRoutes } from "../../test/renderRoutes";
import ProductForm from "./ProductForm";

const manzanas: Product = {
  id: "FR001",
  name: "Manzanas Fuji",
  category: Category.FrutaFresca,
  price: 1200,
  discount: 20,
  unidadVenta: "por kilo",
  img: "manzanas-fuji.webp",
  stock: 150,
  description: "Manzanas crujientes y dulces.",
};

function renderForm(
  product?: Product,
  action: (args: ActionFunctionArgs) => unknown = async () => null,
) {
  const submitted: unknown[] = [];

  const result = renderRoutes([
    {
      path: "/",
      Component: ProductForm,
      loader: () => ({ product }),
      action: async (args) => {
        submitted.push(await args.request.clone().json());
        return action(args);
      },
    },
    { path: "/admin", element: <p>Listado</p> },
  ]);

  return { ...result, submitted };
}

async function fillValidProduct(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Nombre"), "Leche Entera");
  await user.selectOptions(screen.getByLabelText("Categoría"), "Producto lácteo");
  await user.type(screen.getByLabelText("Precio (CLP)"), "1100");
  await user.type(screen.getByLabelText("Stock"), "40");
  await user.clear(screen.getByLabelText("Unidad de venta"));
  await user.type(screen.getByLabelText("Unidad de venta"), "por litro");
  await user.type(
    screen.getByLabelText("Descripción"),
    "Leche entera de libre pastoreo.",
  );
}

describe("ProductForm", () => {
  it("muestra el formulario vacío para crear un producto", async () => {
    renderForm();

    expect(
      await screen.findByRole("heading", { name: "Nuevo producto" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Categoría")).toHaveValue("Frutas frescas");
    expect(screen.getByLabelText("Descuento (%)")).toHaveValue(0);
    expect(screen.getByLabelText("Unidad de venta")).toHaveValue("por kilo");
    expect(
      screen.getByText("El código se genera según la categoría."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear producto" }),
    ).toBeEnabled();
    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("carga los datos del producto al editar", async () => {
    renderForm(manzanas);

    expect(
      await screen.findByRole("heading", { name: "Editar Manzanas Fuji" }),
    ).toBeInTheDocument();
    expect(screen.getByText("FR001")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Manzanas Fuji");
    expect(screen.getByLabelText("Precio (CLP)")).toHaveValue(1200);
    expect(screen.getByLabelText("Descuento (%)")).toHaveValue(20);
    expect(screen.getByLabelText("Stock")).toHaveValue(150);
    expect(
      screen.getByRole("img", { name: /vista previa/i }),
    ).toHaveAttribute("src", expect.stringMatching(/manzanas-fuji\.webp$/));
    expect(
      screen.queryByText("El código se genera según la categoría."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).toBeInTheDocument();
  });

  it("muestra los errores de validación y no envía el formulario", async () => {
    const { user, submitted } = renderForm();

    await user.click(
      await screen.findByRole("button", { name: "Crear producto" }),
    );

    expect(
      await screen.findByText("El nombre debe tener al menos 3 caracteres"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresa un precio")).toBeInTheDocument();
    expect(screen.getByText("Ingresa el stock")).toBeInTheDocument();
    expect(
      screen.getByText("La descripción debe tener al menos 10 caracteres"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInvalid();
    expect(screen.getByLabelText("Descripción")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(submitted).toEqual([]);
  });

  it("envía los datos como JSON a la action", async () => {
    const { user, submitted } = renderForm();

    await fillValidProduct(user);
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    await waitFor(() =>
      expect(submitted).toEqual([
        {
          name: "Leche Entera",
          category: "Producto lácteo",
          price: 1100,
          discount: 0,
          stock: 40,
          unidadVenta: "por litro",
          description: "Leche entera de libre pastoreo.",
          img: "",
        },
      ]),
    );
  });

  it("deshabilita el botón mientras se guarda", async () => {
    let finish!: () => void;
    const { user } = renderForm(
      manzanas,
      () => new Promise<null>((resolve) => (finish = () => resolve(null))),
    );

    await user.click(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    );

    expect(
      await screen.findByRole("button", { name: "Guardando…" }),
    ).toBeDisabled();

    finish();

    expect(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    ).toBeEnabled();
  });

  it("muestra el error que devuelve la action", async () => {
    const { user } = renderForm(manzanas, async () => ({
      error: "No se pudo guardar el producto, intenta nuevamente",
    }));

    await user.click(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo guardar el producto, intenta nuevamente",
    );
  });

  it("muestra la vista previa de la imagen subida y la envía", async () => {
    const { user, submitted } = renderForm(manzanas);
    const file = new File(["imagen"], "foto.png", { type: "image/png" });

    await user.upload(await screen.findByLabelText("Imagen"), file);

    const preview = screen.getByRole("img", { name: /vista previa/i });
    await waitFor(() =>
      expect(preview.getAttribute("src")).toMatch(/^data:image\/png;base64,/),
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(submitted[0]).toMatchObject({
        img: preview.getAttribute("src"),
      }),
    );
  });

  it("rechaza imágenes de más de 1 MB", async () => {
    const { user } = renderForm(manzanas);
    const file = new File([new Uint8Array(1024 * 1024 + 1)], "grande.png", {
      type: "image/png",
    });

    await user.upload(await screen.findByLabelText("Imagen"), file);

    expect(
      screen.getByText("La imagen puede pesar como máximo 1 MB"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /vista previa/i }),
    ).toHaveAttribute("src", expect.stringMatching(/manzanas-fuji\.webp$/));
  });

  it("rechaza archivos que no son imágenes", async () => {
    renderForm(manzanas);
    // Sin applyAccept para simular un navegador que deja elegir cualquier archivo
    const user = userEvent.setup({ applyAccept: false });
    const file = new File(["hola"], "notas.txt", { type: "text/plain" });

    await user.upload(await screen.findByLabelText("Imagen"), file);

    expect(
      screen.getByText("El archivo debe ser una imagen"),
    ).toBeInTheDocument();
  });

  it("quita el error de la imagen si se cancela la selección de archivo", async () => {
    const { user } = renderForm(manzanas);
    const input = await screen.findByLabelText("Imagen");
    const file = new File([new Uint8Array(1024 * 1024 + 1)], "grande.png", {
      type: "image/png",
    });

    await user.upload(input, file);
    expect(
      screen.getByText("La imagen puede pesar como máximo 1 MB"),
    ).toBeInTheDocument();

    // Al cancelar el diálogo del navegador el input queda sin archivos
    fireEvent.change(input, { target: { files: [] } });

    expect(
      screen.queryByText("La imagen puede pesar como máximo 1 MB"),
    ).not.toBeInTheDocument();
  });

  it("avisa si no se pudo leer la imagen", async () => {
    vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(
      function (this: FileReader) {
        this.onerror?.(new ProgressEvent("error") as ProgressEvent<FileReader>);
      },
    );
    const { user } = renderForm(manzanas);
    const file = new File(["imagen"], "foto.png", { type: "image/png" });

    await user.upload(await screen.findByLabelText("Imagen"), file);

    expect(
      await screen.findByText("No se pudo leer la imagen"),
    ).toBeInTheDocument();
  });

  it("pide elegir una categoría si el producto guardado tiene una que ya no existe", async () => {
    const { user, submitted } = renderForm({
      ...manzanas,
      category: "Carnes" as Category,
    });

    await user.click(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    );

    expect(
      await screen.findByText("Selecciona una categoría"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Categoría")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(submitted).toEqual([]);
  });

  it("vuelve al listado al cancelar", async () => {
    const { user } = renderForm();

    await user.click(await screen.findByRole("link", { name: "Cancelar" }));

    expect(screen.getByText("Listado")).toBeInTheDocument();
  });
});
