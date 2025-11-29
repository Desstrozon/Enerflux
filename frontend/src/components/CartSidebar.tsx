import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { OrderList } from 'primereact/orderlist';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { useCart, ProductoCarrito } from '@/context/CartContext';
import { startCheckout } from "@/lib/checkout";
import { alertInfo, alertError } from "@/lib/alerts";

type Props = { visible: boolean; onHide: () => void };

export default function CartSidebar({ visible, onHide }: Props) {

  const [isPaying, setIsPaying] = React.useState(false);
  // manejado del chekout para el botón comprar
  async function handleCheckout() {
    try {
      // requiere usuario autenticado
      const token = localStorage.getItem("token");
      if (!token) {
        await alertInfo("Inicia sesión", "Necesitas iniciar sesión para completar la compra.");
        window.location.assign("/login");
        return;
      }

      if (!cart.length) {
        await alertInfo("Carrito vacío", "Añade algún producto antes de pagar.");
        return;
      }

      setIsPaying(true);
      await startCheckout(); // redirige a Stripe (si todo va bien, no vuelve aquí)
    } catch (e) {
      // ya mostrado por startCheckout, pero por si acaso:
      await alertError("No se pudo iniciar el pago");
    } finally {
      setIsPaying(false);
    }
  }
  const {
    cart,
    addToCart,
    removeOneFromCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const itemTemplate = (item: ProductoCarrito): React.ReactNode => {
    const cantidad = item.cantidad ?? 1;
    const imgSrc = item.imagen
      ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${item.imagen}`
      : '/default.png';

    return (
      <div className="group flex items-center justify-between w-full rounded-2xl border border-border/70 bg-card hover:bg-primary/5 transition-colors px-3 py-2">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={imgSrc}
              alt={item.nombre}
              className="w-12 h-12 object-cover rounded-xl shadow-sm"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="leading-tight">
            <div className="font-medium">{item.nombre}</div>
            <div className="text-sm text-muted-foreground">
              {(item.precio_base ?? 0).toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div className="flex items-center gap-2">
          <InputNumber
            inputId={`qty-${item.id_producto}`}
            value={cantidad}
            min={1}
            inputClassName="!h-8 !py-0 !text-center w-12"
            className="rounded-md"
            onValueChange={(e) => {
              const next = Number(e.value ?? 1);
              const current = item.cantidad ?? 1;
              if (next > current) addToCart(item);
              if (next < current) removeOneFromCart(item.id_producto);
            }}
          />

          {/* Botón RESTAR */}
          <button
            type="button"
            className="btn btn-icon"
            aria-label="Restar"
            onClick={() => removeOneFromCart(item.id_producto)}
          >
            <span className="pi pi-minus" />
          </button>

          {/* Botón SUMAR */}
          <button
            type="button"
            className="btn btn-icon"
            aria-label="Sumar"
            onClick={() => addToCart(item)}
          >
            <span className="pi pi-plus" />
          </button>

          {/* Botón ELIMINAR */}
          <button
            type="button"
            className="btn btn-icon btn-icon-danger"
            aria-label="Eliminar"
            onClick={() => removeFromCart(item.id_producto)}
          >
            <span className="pi pi-trash" />
          </button>
        </div>

      </div>
    );
  };

  function apiPostJson<T>(arg0: string, arg1: {}): { url: any; } | PromiseLike<{ url: any; }> {
    throw new Error('Function not implemented.');
  }

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      dismissable
      showCloseIcon
      blockScroll
      className="cart-panel !w-full md:!w-[28rem]"  //  clase para forzar superficies
      pt={{
        content: { className: '!p-0' },
        mask: { className: 'backdrop-blur-[2px]' }
      }}
    >
      {/* Superficie neutra (sin gradientes) */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="cart-header flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-xl font-semibold">Tu carrito</h2>
          <span className="text-sm text-muted-foreground">{totalItems} artículo(s)</span>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <span className="pi pi-shopping-cart text-3xl mb-3 block" />
              El carrito está vacío.
            </div>
          ) : (
            <OrderList
              value={cart}
              itemTemplate={itemTemplate}
              header={<div className="px-2 py-2 text-sm font-medium">Productos</div>}
              dragdrop
              dataKey="id_producto"
              className="w-full no-select pretty-orderlist"
            />
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer border-t px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Total</span>
            <span className="text-lg font-semibold">{totalPrice.toFixed(2)} €</span>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button
              label="Vaciar"
              icon="pi pi-times"
              outlined
              onClick={clearCart}
              disabled={cart.length === 0 || isPaying}
            />
            <Button
              label={isPaying ? "Redirigiendo..." : "Comprar"}
              icon={isPaying ? "pi pi-spin pi-spinner" : "pi pi-credit-card"}
              onClick={handleCheckout}
              disabled={cart.length === 0 || isPaying}
              className="!bg-primary !border-primary hover:!bg-primary/90 focus:!shadow-none"
            />
          </div>


        </div>
      </div>
    </Sidebar>
  );
}
