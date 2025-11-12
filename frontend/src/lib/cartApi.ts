import { apiGet, apiPostJson } from "./http";

export type CartItemDTO = {
  id: number;
  producto_id: number;
  nombre: string;
  precio_base: number;
  imagen: string | null;
  cantidad: number;
};

export type CartDTO = {
  id: number;
  user_id: number;
  currency: string;
  subtotal: number;
  total: number;
  items: CartItemDTO[];
};

// ===== API =====

export function getCart() {
  return apiGet<CartDTO>("/cart");
}

export function addItem(producto_id: number, quantity = 1) {
  return apiPostJson<CartDTO>("/cart/add", { producto_id, quantity });
}

export function updateQty(producto_id: number, quantity: number) {
  return apiPostJson<CartDTO>("/cart/update", { producto_id, quantity });
}

export function removeItem(producto_id: number) {
  return apiPostJson<CartDTO>("/cart/remove", { producto_id });
}

export function clearServerCart() {
  return apiPostJson<CartDTO>("/cart/clear", {});
}

/** items = [{ producto_id, cantidad }] */
export function syncCart(items: { producto_id: number; cantidad: number }[]) {
  return apiPostJson<CartDTO>("/cart/sync", { items });
}
