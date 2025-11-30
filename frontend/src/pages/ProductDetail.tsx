import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/http";
import { useCart } from "@/context/CartContext";
import { alertError, alertSuccess, confirm } from "@/lib/alerts";
import StarRating from "@/components/StarRating";

// ===== tipos =====
type PanelInfo = {
  modelo?: string | null;
  eficiencia?: number | null;
  superficie?: number | null;
  produccion?: number | null;
};

type BateriaInfo = {
  modelo?: string | null;
  capacidad?: number | null;
  autonomia?: number | null;
};

type ProductoImage = { id?: number; path?: string; url?: string };

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  imagen?: string | null;
  stock?: number;
  // relaciones
  panel?: PanelInfo | null;
  bateria?: BateriaInfo | null;
  // posibles galerías que envíe el backend
  galeria?: string[] | null;
  images?: ProductoImage[] | null;
};

type Review = {
  id: number;
  producto_id: number;
  user_id: number;
  rating: number;
  comment?: string | null;
  likes: number;
  dislikes: number;
  created_at: string;
  user?: { id: number; name: string };
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [p, setP] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  const [myRating, setMyRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const me = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);
  const isLogged = !!me;
  const isAdmin = useMemo(
    () => ["admin", "administrador"].includes(String(me?.rol || "").toLowerCase()),
    [me?.rol]
  );

  const [myReactions, setMyReactions] = useState<Record<number, "like" | "dislike">>({});
  useEffect(() => {
    try { const raw = localStorage.getItem("reviewReactions"); if (raw) setMyReactions(JSON.parse(raw)); } catch {}
  }, []);
  const saveReactions = (next: Record<number, "like" | "dislike">) => {
    setMyReactions(next);
    try { localStorage.setItem("reviewReactions", JSON.stringify(next)); } catch {}
  };

  const fetchReviews = async (productId: string | number) => {
    const r = await apiGet<{ avg: number; count: number; reviews: Review[] }>(`/productos/${productId}/reviews`);
    setReviews(r.reviews);
    setAvg(r.avg);
    setCount(r.count);
    return r;
  };

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const prod = await apiGet<Producto>(`/productos/${id}`);
      setP(prod);

      const r = await fetchReviews(id);
      if (me) {
        const mine = r.reviews.find((x) => x.user_id === me.id);
        setMyRating(mine ? mine.rating : 0);
        setComment(mine?.comment ?? "");
      }
    } catch (e) {
      await alertError("No se pudo cargar el producto");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // === GALERÍA ===
  const base = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
  const mainUrl = p?.imagen ? `${base}/storage/${p.imagen}` : null;

  // construimos el array de imágenes de galería
  const gallery: string[] = (() => {
    const urls: string[] = [];
    if (mainUrl) urls.push(mainUrl);

    // si el backend devuelve 'galeria' como rutas relativas
    if (Array.isArray(p?.galeria)) {
      for (const rel of p!.galeria!) {
        urls.push(`${base}/storage/${rel}`);
      }
    }

    // o si devuelve 'images' con objetos { path | url }
    if (Array.isArray(p?.images)) {
      for (const im of p!.images!) {
        const u = im.url ?? (im.path ? `${base}/storage/${im.path}` : null);
        if (u) urls.push(u);
      }
    }

    const uniq = Array.from(new Set(urls));
    return uniq.length ? uniq : ["/default.png"];
  })();

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [p?.id_producto]); // al cambiar producto, reiniciar selección

  const hasMine = useMemo(() => reviews.some((r) => r.user_id === me?.id), [reviews, me?.id]);

  const submitReview = async () => {
    if (!isLogged) { await alertError("Inicia sesión para valorar"); return; }
    if (!myRating || myRating <= 0) { await alertError("Selecciona una valoración."); return; }
    try {
      await apiPost(`/productos/${id}/reviews`, { rating: myRating, comment });
      const r = await fetchReviews(id as string);
      window.dispatchEvent(new CustomEvent("reviews:changed", { detail: { productId: Number(id), average: r.avg, count: r.count } }));
      setComment("");
      await alertSuccess(hasMine ? "Reseña actualizada" : "¡Gracias por tu reseña!");
    } catch (e: any) {
      await alertError(e?.message || "No se pudo guardar la reseña");
    }
  };

  const react = async (rid: number, type: "like" | "dislike") => {
    if (myReactions[rid] === type) return;
    setReviews(prev => prev.map(r => {
      if (r.id !== rid) return r;
      const n = { ...r };
      if (myReactions[rid] === "like" && type === "dislike") n.likes = Math.max(0, n.likes - 1);
      if (myReactions[rid] === "dislike" && type === "like") n.dislikes = Math.max(0, n.dislikes - 1);
      if (type === "like") n.likes += 1;
      if (type === "dislike") n.dislikes += 1;
      return n;
    }));
    const next = { ...myReactions, [rid]: type };
    saveReactions(next);
    try { await apiPost(`/reviews/${rid}/react`, { type }); } catch {}
  };

  const canDelete = (r: Review) => !!me && (isAdmin || me.id === r.user_id);

  const deleteReview = async (rid: number) => {
    const ok = await confirm("Borrar reseña", "Esta acción no se puede deshacer.", "Borrar");
    if (!ok) return;
    try {
      await apiDelete(`/reviews/${rid}`);
      const wasMine = reviews.find((r) => r.id === rid && r.user_id === me?.id);
      if (wasMine) { setMyRating(0); setComment(""); }
      const r = await fetchReviews(id as string);
      window.dispatchEvent(new CustomEvent("reviews:changed", { detail: { productId: Number(id), average: r.avg, count: r.count } }));
      await alertSuccess("Reseña eliminada");
    } catch (e: any) {
      await alertError(e?.message || "No se pudo eliminar la reseña");
    }
  };

  if (loading || !p) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ==== IMAGEN + GALERÍA ==== */}
          <div>
            {/* Contenedor sin márgenes del Card; hover-zoom */}
            <div className="group overflow-hidden rounded-xl bg-black/10">
              <img
                src={gallery[idx]}
                alt={p.nombre}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {gallery.map((u, i) => (
                  <button
                    key={`${u}-${i}`}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`h-16 w-16 rounded-md overflow-hidden border transition
                      ${i === idx ? "ring-2 ring-primary border-transparent" : "border-border hover:border-foreground/40"}`}
                    title={`Imagen ${i + 1}`}
                  >
                    <img src={u} alt={`mini-${i}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==== INFO ==== */}
          <div>
            <h1 className="text-3xl font-semibold">{p.nombre}</h1>
            <div className="mt-2 text-sm text-muted-foreground uppercase">{p.categoria}</div>

            <div className="mt-4 flex items-center gap-2">
              <StarRating value={avg} readOnly />
              <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} · {count} {count === 1 ? "reseña" : "reseñas"}
              </span>
            </div>

            <div className="mt-6 text-3xl font-bold text-primary">
              {Number(p.precio_base || 0).toFixed(2)} €
            </div>

            <div className="mt-4 text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
              {p.descripcion || "Sin descripción."}
            </div>

            {/* FICHA TÉCNICA */}
            {(p.categoria === "panel" && p.panel) && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">Ficha técnica (Panel)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>Modelo: <span className="text-foreground/80">{p.panel?.modelo ?? "—"}</span></div>
                    <div>Eficiencia: <span className="text-foreground/80">{p.panel?.eficiencia ?? "—"} %</span></div>
                    <div>Superficie: <span className="text-foreground/80">{p.panel?.superficie ?? "—"} m²</span></div>
                    <div>Producción: <span className="text-foreground/80">{p.panel?.produccion ?? "—"} kWh/año</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(p.categoria === "bateria" && p.bateria) && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">Ficha técnica (Batería)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>Modelo: <span className="text-foreground/80">{p.bateria?.modelo ?? "—"}</span></div>
                    <div>Capacidad: <span className="text-foreground/80">{p.bateria?.capacidad ?? "—"} kWh</span></div>
                    <div>Autonomía: <span className="text-foreground/80">{p.bateria?.autonomia ?? "—"} h</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6">
              <Button
                onClick={() =>
                  addToCart({
                    id_producto: p.id_producto,
                    nombre: p.nombre,
                    precio_base: p.precio_base,
                    imagen: p.imagen,
                    cantidad: 1,
                  })
                }
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Añadir al carrito
              </Button>
            </div>
          </div>
        </div>

        {/* RESEÑAS */}
        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Tu valoración</h3>
              {!isLogged ? (
                <p className="text-sm text-muted-foreground">Inicia sesión para dejar una reseña.</p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <StarRating value={myRating} onChange={setMyRating} />
                    <span className="text-sm text-muted-foreground">{myRating.toFixed(1)} / 5</span>
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe tu opinión (opcional)…"
                    rows={4}
                  />
                  <Button onClick={submitReview}>{hasMine ? "Actualizar reseña" : "Guardar reseña"}</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Reseñas</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sé el primero en opinar.</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <StarRating value={r.rating} readOnly size={16} />
                        <span className="text-xs text-muted-foreground">· {r.user?.name ?? "Usuario"} · {new Date(r.created_at).toLocaleDateString()}</span>
                        {(!!me && (isAdmin || me.id === r.user_id)) && (
                          <Button
                            variant="destructive"
                            size="xs"
                            className="ml-auto h-7 px-2"
                            onClick={() => deleteReview(r.id)}
                            title="Eliminar reseña"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      {r.comment && <div className="mt-2 text-sm text-foreground/90 whitespace-pre-line">{r.comment}</div>}
                      <div className="mt-2 flex items-center gap-4">
                        <button
                          className={`flex items-center gap-1 text-sm ${myReactions[r.id] === "like" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => react(r.id, "like")}
                          title="Me gusta"
                        >
                          👍 {r.likes}
                        </button>
                        <button
                          className={`flex items-center gap-1 text-sm ${myReactions[r.id] === "dislike" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => react(r.id, "dislike")}
                          title="No me gusta"
                        >
                          👎 {r.dislikes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
