import { useMemo, useSyncExternalStore } from "react";
import { cartChannel, countItems, parseCart } from "../services/cart";

export function useCart() {
  const saved = useSyncExternalStore(cartChannel.subscribe, cartChannel.read);

  return useMemo(() => parseCart(saved), [saved]);
}

export function useCartCount() {
  return countItems(useCart());
}
