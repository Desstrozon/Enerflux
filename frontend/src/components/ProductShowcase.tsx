// src/components/ProductShowcase.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { apiGet, APP_BASE } from "@/lib/http";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import StarRating from "@/components/StarRating";
import { Input } from "@/components/ui/input";

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  imagen?: string | null;
  stock?: number;
  disponible?: boolean;
};

type RatingSummary = { avg: number; count: number };

export default function ProductShowcase() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  //  caché por producto
  const [ratings, setRatings] = useState<Record<number, RatingSummary>>({});
  const [q, setQ] = useState("");

  // ---------- CARGA INICIAL ----------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Producto[]>("/productos");
        const list = Array.isArray(data) ? data : (data as any).data ?? [];
        setProductos(list);

        // carga paralela de ratings
        const pairs = await Promise.all(
          list.map(async (p: Producto) => {
            try {
              const r = await apiGet<{ avg: number; count: number }>(`/productos/${p.id_producto}/reviews`);
              return [p.id_producto, { avg: r.avg || 0, count: r.count || 0 }] as const;
            } catch {
              return [p.id_producto, { avg: 0, count: 0 }] as const;
            }
          })
        );
        const map: Record<number, RatingSummary> = {};
        for (const [id, val] of pairs) map[id] = val;
        setRatings(map);
      } finally {
        setLoading(false);
        //  AVISO: la sección “productos” ya está disponible (para que Index haga scroll aunque tarde en cargar)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("section:ready", { detail: "productos" }));
        }, 0);
      }
    };
    load();
  }, []);

  // ---------- ACTUALIZACIÓN EN VIVO DESDE ProductDetail ----------
  useEffect(() => {
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { productId: number; average: number; count: number };
      if (!detail?.productId) return;
      setRatings((prev) => ({ ...prev, [detail.productId]: { avg: detail.average, count: detail.count } }));
    };
    window.addEventListener("reviews:changed", onChanged as EventListener);
    return () => window.removeEventListener("reviews:changed", onChanged as EventListener);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(needle) ||
        (p.categoria || "").toLowerCase().includes(needle) ||
        (p.descripcion || "").toLowerCase().includes(needle)
    );
  }, [q, productos]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Cargando productos...</div>;
  }

  return (
    <section id="productos" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header con buscador */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Nuestros Productos</h2>
          </div>
          <div className="relative w-full md:w-96">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, categoría…"
              className="pl-3 pr-3 h-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => {
            const relOrUrl =
              p.imagen ||
              (Array.isArray((p as any).images) && (p as any).images.length
                ? ((p as any).images[0].path || (p as any).images[0].url || "")
                : "");

            const imgUrl = relOrUrl
              ? relOrUrl.startsWith("http")
                ? relOrUrl
                : `https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/storage/${relOrUrl
                  .replace(/^storage\//, "")
                  .replace(/^public\//, "")}`
              : "https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/default.png";


            const disponible = p.disponible ?? ((p.stock ?? 0) > 0);
            const r = ratings[p.id_producto] || { avg: 0, count: 0 };

            return (
              <Card
                key={p.id_producto}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50"
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
                    <div className="flex items-center gap-2 ml-auto">
                      <StarRating value={r.avg} readOnly size={16} />
                      <span className="text-sm text-muted-foreground">
                        {r.avg.toFixed(1)} ({r.count})
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{p.nombre}</h3>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {Number(p.precio_base || 0).toFixed(2)} €
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/producto/${p.id_producto}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </Button>
                      <Button
                        variant="cta"
                        size="sm"
                        disabled={!disponible}
                        onClick={() =>
                          disponible &&
                          addToCart({
                            id_producto: p.id_producto,
                            nombre: p.nombre,
                            precio_base: p.precio_base,
                            imagen: p.imagen,
                            cantidad: 1,
                          })
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
