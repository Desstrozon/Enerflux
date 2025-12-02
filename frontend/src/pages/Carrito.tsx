import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { APP_BASE } from "@/lib/http";

export default function Carrito() {
  const { carrito, removeFromCart, clearCart } = useCart();

  const total = carrito.reduce(
    (acc, item) => acc + item.precio_base * (item.cantidad ?? 1),
    0
  );

  if (carrito.length === 0) {
    return <div className="text-center py-20">Tu carrito está vacío 🛒</div>;
  }

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Tu Carrito</h1>

      <div className="space-y-4">
        {carrito.map((item) => (
          <div
            key={item.id_producto}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  item.imagen
                    ? item.imagen.startsWith("http")
                      ? item.imagen
                      : `https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/storage/${item.imagen.replace(/^storage\//, "")}`
                    : "https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/default.png"
                }
                alt={item.nombre}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium">{item.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.precio_base} € x {item.cantidad}
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id_producto)}>
              Eliminar
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Total: {total.toFixed(2)} €</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={clearCart}>
            Vaciar carrito
          </Button>
          <Button>Finalizar compra</Button>
        </div>
      </div>
    </main>
  );
}
