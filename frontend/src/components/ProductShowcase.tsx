import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useCart } from "@/context/CartContext";

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  imagen?: string | null;
  stock?: number;            // 👈 viene del backend
  disponible?: boolean;      // 👈 si añadiste el accessor en el modelo
};

const ProductShowcase = () => {
  const { addToCart } = useCart();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<Producto[]>("/productos");
        setProductos(Array.isArray(data) ? data : (data as any).data ?? []);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Cargando productos...</div>;
  }

  return (
    <section id="productos" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Productos</h2>
          <p className="text-lg text-muted-foreground">
            Descubre todos los productos disponibles en Enerflux.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productos.map((p, index) => {
            const imgUrl = p.imagen
              ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/storage/${p.imagen}`
              : "/default.png";

            // 👇 regla de disponibilidad: usa el accessor o cae a stock>0
            const disponible = (p.disponible ?? ((p.stock ?? 0) > 0));

            return (
              <Card
                key={p.id_producto}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={imgUrl}
                    alt={p.nombre}
                    className={
                      "w-full h-full object-cover transition-transform duration-500 " +
                      (disponible ? "group-hover:scale-110" : "grayscale opacity-70")
                    }
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {p.categoria}
                  </div>

                  {!disponible && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-center py-2 text-sm">
                      No disponible
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {p.categoria}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{p.nombre}</h3>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {Number(p.precio_base || 0).toFixed(2)} €
                    </span>

                    <Button
                      variant="cta"
                      size="sm"
                      className="group"
                      disabled={!disponible}
                      onClick={() => {
                        if (!disponible) return;
                        addToCart({
                          id_producto: p.id_producto,
                          nombre: p.nombre,
                          precio_base: p.precio_base,
                          imagen: p.imagen,
                          cantidad: 1, // 👈 evita NaN y deja claro el qty
                        });
                      }}
                    >
                      {disponible ? (
                        <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      ) : (
                        <span className="text-xs">No disponible</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
