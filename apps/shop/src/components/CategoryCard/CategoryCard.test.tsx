import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { Category } from "@huerto/shared";
import CategoryCard from "./CategoryCard";

function renderCard(description: string) {
  const { container } = render(
    <MemoryRouter>
      <CategoryCard
        category={Category.ProductoLacteo}
        description={description}
      />
    </MemoryRouter>,
  );

  return container;
}

describe("CategoryCard", () => {
  it("enlaza al catálogo filtrado por la categoría", () => {
    renderCard("Frescura del campo");

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/catalog/producto-lacteo",
    );
    expect(
      screen.getByRole("heading", { name: "Producto lácteo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frescura del campo")).toBeInTheDocument();
    expect(screen.getByText("Ver productos")).toBeInTheDocument();
  });

  it("usa la imagen de la categoría como decoración", () => {
    const container = renderCard("Frescura del campo");
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute(
      "src",
      expect.stringMatching(/producto-lacteo\.webp$/),
    );
  });

  it("no muestra la descripción si está vacía", () => {
    const container = renderCard("");

    expect(container.querySelector(".description")).toBeNull();
  });
});
