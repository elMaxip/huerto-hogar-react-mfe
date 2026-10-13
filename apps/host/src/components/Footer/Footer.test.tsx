import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import Footer from "./Footer";

function renderFooter() {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer", () => {
  it("agrupa los enlaces de la tienda y de HuertoHogar", () => {
    renderFooter();

    const shop = within(screen.getByRole("navigation", { name: "Tienda" }));
    const brand = within(screen.getByRole("navigation", { name: "HuertoHogar" }));

    expect(
      shop.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([
      "/catalog",
      "/catalog/frutas-frescas",
      "/catalog/verdura-organica",
      "/cart",
    ]);
    expect(brand.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("muestra los datos de contacto", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "+56 2 2345 6789" })).toHaveAttribute(
      "href",
      "tel:+56223456789",
    );
    expect(
      screen.getByRole("link", { name: "contacto@huertohogar.cl" }),
    ).toHaveAttribute("href", "mailto:contacto@huertohogar.cl");
  });

  it("muestra el año actual en el copyright", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2030, 5, 1));

    renderFooter();

    expect(screen.getByText(/© 2030 HuertoHogar SpA/)).toBeInTheDocument();
  });
});
