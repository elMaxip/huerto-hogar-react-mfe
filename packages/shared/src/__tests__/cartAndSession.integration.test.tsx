import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  addToCart,
  clearCart,
  isAdmin,
  login,
  logout,
  Role,
  useCart,
  useCartCount,
  useSession,
} from "..";
import { Modal, PrimaryButton } from "../ui";

/** Dos componentes independientes que comparten estado solo por localStorage */
function CartBadge() {
  return <span data-testid="badge">{useCartCount()}</span>;
}

function CartList() {
  const items = useCart();

  return (
    <>
      <ul aria-label="Carrito">
        {items.map((item) => (
          <li key={item.productId}>
            {item.productId} x{item.quantity}
          </li>
        ))}
      </ul>
      <PrimaryButton onClick={() => addToCart("FR001")}>Agregar</PrimaryButton>
      <PrimaryButton onClick={clearCart}>Vaciar</PrimaryButton>
    </>
  );
}

function Account() {
  const session = useSession();

  return (
    <Modal open label="Cuenta" onClose={() => {}}>
      {session ? (
        <>
          <p>Hola, {session.fullname}</p>
          {isAdmin(session) && <a href="/admin">Administración</a>}
          <PrimaryButton onClick={logout}>Cerrar sesión</PrimaryButton>
        </>
      ) : (
        <p>Sin sesión</p>
      )}
    </Modal>
  );
}

describe("integración de @huerto/shared", () => {
  it("sincroniza el carrito entre componentes que no comparten estado", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CartBadge />
        <CartList />
      </>,
    );

    expect(screen.getByTestId("badge")).toHaveTextContent("0");

    await user.click(screen.getByRole("button", { name: "Agregar" }));
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByTestId("badge")).toHaveTextContent("2");
    expect(screen.getByRole("list", { name: "Carrito" })).toHaveTextContent(
      "FR001 x2",
    );

    await user.click(screen.getByRole("button", { name: "Vaciar" }));

    expect(screen.getByTestId("badge")).toHaveTextContent("0");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("muestra la sesión en el modal y permite cerrarla", async () => {
    const user = userEvent.setup();
    login({
      id: 1,
      fullname: "Administrador",
      email: "admin@huertohogar.cl",
      password: "admin1234",
      role: Role.Admin,
    });

    render(<Account />);

    const dialog = screen.getByRole("dialog", { name: "Cuenta" });
    expect(dialog).toHaveTextContent("Hola, Administrador");
    expect(screen.getByRole("link", { name: "Administración" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(dialog).toHaveTextContent("Sin sesión");
    expect(localStorage.getItem("user")).toBeNull();
  });
});
