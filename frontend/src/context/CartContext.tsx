import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { getCart, addItem, updateQty, removeItem, clearServerCart, syncCart, CartDTO } from "@/lib/cartApi";

/* Tipos del frontend */
export type ProductoCarrito = {
  id_producto: number;
  nombre: string;
  precio_base: number;
  imagen?: string | null;
  cantidad?: number;
};

type CartContextType = {
  cart: ProductoCarrito[];
  addToCart: (p: ProductoCarrito) => void;
  removeOneFromCart: (id_producto: number) => void;
  removeFromCart: (id_producto: number) => void;
  clearCart: () => void;
  setQty: (id_producto: number, qty: number) => void;
  totalItems: number;
  totalPrice: number;
  isLoggedIn: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/* Identidad/clave por usuario */
function getUserIdFragment(): string {
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token") || "";
    const u = raw ? JSON.parse(raw) : null;
    return u?.id ?? u?.ID ?? u?.email ?? u?.name ?? (token ? `token:${token}` : "guest");
  } catch {
    return "guest";
  }
}
const keyFor = (frag: string) => `cart:user:${frag}`;
const currentKey = () => keyFor(getUserIdFragment());

/* Helpers localStorage para fallback/guest o cache */
function loadLocal(key: string): ProductoCarrito[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveLocal(key: string, items: ProductoCarrito[]) {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch {}
}

/* Map DTO->Front */
function mapFromDTO(dto?: CartDTO): ProductoCarrito[] {
  if (!dto) return [];
  return dto.items.map(it => ({
    id_producto: it.producto_id,
    nombre: it.nombre,
    precio_base: it.precio_base,
    imagen: it.imagen,
    cantidad: it.cantidad,
  }));
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [storageKey, setStorageKey] = useState(currentKey);
  const [cart, setCart] = useState<ProductoCarrito[]>(() => loadLocal(storageKey));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("token"));

  // refs para estabilidad
  const lastStable = useRef<ProductoCarrito[]>(cart);
  const justMergedRef = useRef(false);
  const serverReadyRef = useRef(false);

  // Persist local cache (siempre)
  useEffect(() => { saveLocal(storageKey, cart); }, [cart, storageKey]);

  // Recalcula clave y estado de login en eventos típicos
  useEffect(() => {
    const recomputeIdentity = async () => {
      const nextKey = currentKey();
      setIsLoggedIn(!!localStorage.getItem("token"));

      // LOGIN (guest -> user): fusiona y sube al servidor
      const prevFrag = storageKey.replace("cart:user:", "");
      const nextFrag = nextKey.replace("cart:user:", "");
      const guestKey = keyFor("guest");

      if (prevFrag === "guest" && nextFrag !== "guest") {
        const guestItems = loadLocal(guestKey);

        try {
          const server = await getCart().catch(() => null);

          // fusiona server + guest (sumando cantidades)
          const mergedMap = new Map<number, ProductoCarrito>();
          const push = (it: ProductoCarrito) => {
            const prev = mergedMap.get(it.id_producto);
            const qty = (it.cantidad ?? 1) + (prev?.cantidad ?? 0);
            mergedMap.set(it.id_producto, { ...(prev ?? it), cantidad: Math.max(1, qty) });
          };
          mapFromDTO(server).forEach(push);
          guestItems.forEach(push);
          const merged = Array.from(mergedMap.values());

          // 1) Sube al servidor
          await syncCart(merged.map(it => ({ producto_id: it.id_producto, cantidad: it.cantidad ?? 1 })));

          // 2) Relee del servidor como fuente de verdad
          const fresh = await getCart();
          const ui = mapFromDTO(fresh);

          // 3) Persistimos también en local de la clave del usuario (por si otro effect recarga)
          saveLocal(nextKey, ui);

          // 4) Limpiamos invitado y marcamos merge
          localStorage.removeItem(guestKey);
          justMergedRef.current = true;
          serverReadyRef.current = true;

          setStorageKey(nextKey);
          setCart(ui);
          lastStable.current = ui;
          return;

        } catch {
          // Si falla el servidor, al menos migra invitado a la clave del usuario y persiste
          saveLocal(nextKey, guestItems);
          localStorage.removeItem(guestKey);
          justMergedRef.current = true;
          serverReadyRef.current = false;

          setStorageKey(nextKey);
          setCart(guestItems);
          lastStable.current = guestItems;
          return;
        }
      }

      // LOGOUT (user -> guest): deja server guardado, arranca guest vacío
      if (prevFrag !== "guest" && nextFrag === "guest") {
        setStorageKey(nextKey);
        setCart([]);
        lastStable.current = [];
        return;
      }

      // Cambio de usuario o refresco
      if (nextKey !== storageKey) {
        setStorageKey(nextKey);

        // Si acabamos de mergear, NO sobreescribas inmediatamente
        if (justMergedRef.current) {
          justMergedRef.current = false;
          return;
        }

        // Si logueado y ya hay server listo, espera al refresco; si no, carga fallback local
        try {
          if (nextFrag !== "guest") {
            const fresh = await getCart();
            const ui = mapFromDTO(fresh);
            setCart(ui);
            lastStable.current = ui;
            serverReadyRef.current = true;
          } else {
            const local = loadLocal(nextKey);
            setCart(local);
            lastStable.current = local;
          }
        } catch {
          const local = loadLocal(nextKey);
          setCart(local);
          lastStable.current = local;
        }
      } else {
        // Misma clave: trae cambios externos (otra pestaña) si logueado
        if (nextFrag !== "guest") {
          try {
            const fresh = await getCart();
            const ui = mapFromDTO(fresh);
            // evita “parpadeos”: solo aplica si realmente cambia
            if (JSON.stringify(ui) !== JSON.stringify(lastStable.current)) {
              setCart(ui);
              lastStable.current = ui;
              saveLocal(storageKey, ui);
            }
            serverReadyRef.current = true;
          } catch { /* ignore */ }
        }
      }
    };

    const onAuthChanged = () => recomputeIdentity();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "user" || e.key === "token" || e.key === storageKey) recomputeIdentity();
    };
    const onFocus = () => recomputeIdentity();
    const onVisible = () => { if (document.visibilityState === "visible") recomputeIdentity(); };

    window.addEventListener("auth:changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    // primera sincronización
    recomputeIdentity();

    return () => {
      window.removeEventListener("auth:changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [storageKey]);

  /* Helpers de estado */
  const totalItems = useMemo(() => cart.reduce((a, p) => a + (p.cantidad ?? 1), 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((a, p) => a + (p.precio_base ?? 0) * (p.cantidad ?? 1), 0), [cart]);

  /* Optimistic helpers (con rollback si server falla) */
  function withOptimism(
    updater: (prev: ProductoCarrito[]) => ProductoCarrito[],
    serverCall?: () => Promise<any>
  ) {
    const prev = cart;
    const next = updater(prev);
    setCart(next);
    lastStable.current = next;
    if (!isLoggedIn || !serverCall) return;
    serverCall().catch(() => {
      // rollback si falla
      setCart(prev);
      lastStable.current = prev;
    });
  }

  const addToCart = (p: ProductoCarrito) => {
    withOptimism(
      (prev) => {
        const idx = prev.findIndex(x => x.id_producto === p.id_producto);
        if (idx === -1) return [...prev, { ...p, cantidad: Math.max(1, p.cantidad ?? 1) }];
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: (next[idx].cantidad ?? 1) + 1 };
        return next;
      },
      () => addItem(p.id_producto, 1)
    );
  };

  const setQty = (id_producto: number, qty: number) => {
    withOptimism(
      (prev) => {
        const idx = prev.findIndex(x => x.id_producto === id_producto);
        if (idx === -1 && qty > 0) return prev;
        if (qty <= 0) return prev.filter(x => x.id_producto !== id_producto);
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: qty };
        return next;
      },
      () => updateQty(id_producto, Math.max(0, qty))
    );
  };

  const removeOneFromCart = (id_producto: number) => {
    const item = cart.find(x => x.id_producto === id_producto);
    const qty = (item?.cantidad ?? 1) - 1;
    setQty(id_producto, qty);
  };

  const removeFromCart = (id_producto: number) => {
    withOptimism(
      (prev) => prev.filter(x => x.id_producto !== id_producto),
      () => removeItem(id_producto)
    );
  };

  const clearCart = () => {
    withOptimism(
      () => [],
      () => clearServerCart()
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeOneFromCart, removeFromCart, clearCart, setQty, totalItems, totalPrice, isLoggedIn }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
