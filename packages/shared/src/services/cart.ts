import { createStorageChannel } from "./storage";

export interface CartItem {
  productId: string;
  quantity: number;
}

/** Se dispara en window cada vez que el carrito cambia */
export const CART_CHANGE_EVENT = "cart:change";

export const cartChannel = createStorageChannel("cart", CART_CHANGE_EVENT);

export function parseCart(saved: string | null): CartItem[] {
  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    // El localStorage lo edita el usuario: descartamos lo que no tenga forma de CartItem
    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.productId === "string" &&
        Number.isInteger(item?.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function getCart(): CartItem[] {
  return parseCart(cartChannel.read());
}

function save(items: CartItem[]) {
  cartChannel.write(JSON.stringify(items));
}

export function addToCart(productId: string, quantity = 1) {
  if (quantity < 1) return;

  const items = getCart();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }

  save(items);
}

export function setQuantity(productId: string, quantity: number) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  const items = getCart();
  const existing = items.find((item) => item.productId === productId);

  if (!existing || existing.quantity === quantity) return;

  existing.quantity = quantity;
  save(items);
}

export function removeFromCart(productId: string) {
  save(getCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  cartChannel.write(null);
}

export function countItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
