import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { alertError, alertSuccess, confirm } from "@/lib/alerts";
import StarRating from "@/components/StarRating";

type Producto = {
    id_producto: number;
    nombre: string;
    descripcion?: string;
    categoria: string;
    precio_base: number;
    imagen?: string | null;
    stock?: number;
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

    // Form reseña
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

    // Reacciones del usuario (persistidas localmente)
    const [myReactions, setMyReactions] = useState<Record<number, "like" | "dislike">>({});
    useEffect(() => {
        try {
            const raw = localStorage.getItem("reviewReactions");
            if (raw) setMyReactions(JSON.parse(raw));
        } catch { }
    }, []);
    const saveReactions = (next: Record<number, "like" | "dislike">) => {
        setMyReactions(next);
        try { localStorage.setItem("reviewReactions", JSON.stringify(next)); } catch { }
    };

    const fetchReviews = async (productId: string | number) => {
        const r = await apiGet<{ avg: number; count: number; reviews: Review[] }>(
            `/productos/${productId}/reviews`
        );
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

            // si ya dejó reseña, precargar para editar
            if (me) {
                const mine = r.reviews.find((x) => x.user_id === me.id);
                if (mine) {
                    setMyRating(mine.rating);
                    setComment(mine.comment ?? "");
                } else {
                    setMyRating(0);
                    setComment("");
                }
            }
        } catch (e) {
            console.error(e);
            await alertError("No se pudo cargar el producto");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const imgUrl = p?.imagen
        ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/storage/${p.imagen}`
        : "/default.png";

    const hasMine = useMemo(() => reviews.some((r) => r.user_id === me?.id), [reviews, me?.id]);

    // Crear/actualizar reseña
    const submitReview = async () => {
        if (!isLogged) {
            await alertError("Inicia sesión para valorar");
            return;
        }
        if (!myRating || myRating <= 0) {
            await alertError("Selecciona una valoración.");
            return;
        }
        try {
            await apiPost(`/productos/${id}/reviews`, { rating: myRating, comment });

            // Refresca métricas/lista
            const r = await fetchReviews(id as string);

            // Notifica al showcase para refrescar estrella y conteo
            window.dispatchEvent(
                new CustomEvent("reviews:changed", {
                    detail: { productId: Number(id), average: r.avg, count: r.count },
                })
            );

            // Limpia comentario tras guardar (queda tu rating seleccionado)
            setComment("");
            await alertSuccess(hasMine ? "Reseña actualizada" : "¡Gracias por tu reseña!");
        } catch (e: any) {
            await alertError(e?.message || "No se pudo guardar la reseña");
        }
    };

    // Like/Dislike optimista (sin recargar todo)
    const react = async (rid: number, type: "like" | "dislike") => {
        // Evita múltiples votos del mismo tipo
        if (myReactions[rid] === type) return;

        // Optimista: clona lista y aplica cambio local
        setReviews((prev) =>
            prev.map((r) => {
                if (r.id !== rid) return r;
                const next = { ...r };
                // Si tenía la contraria, la quitamos
                if (myReactions[rid] === "like" && type === "dislike") next.likes = Math.max(0, next.likes - 1);
                if (myReactions[rid] === "dislike" && type === "like") next.dislikes = Math.max(0, next.dislikes - 1);
                // Añadimos la nueva
                if (type === "like") next.likes += 1;
                if (type === "dislike") next.dislikes += 1;
                return next;
            })
        );
        const nextReactions = { ...myReactions, [rid]: type };
        saveReactions(nextReactions);

        try {
            await apiPost(`/reviews/${rid}/react`, { type });
            // (si quisieras asegurar conteos exactos, podrías refetch aquí,
            // pero normalmente no hace falta)
        } catch {
            // si falla, revertimos optimismo
            setReviews((prev) =>
                prev.map((r) => {
                    if (r.id !== rid) return r;
                    const next = { ...r };
                    if (type === "like") next.likes = Math.max(0, next.likes - 1);
                    if (type === "dislike") next.dislikes = Math.max(0, next.dislikes - 1);
                    // restaurar la reacción previa
                    if (myReactions[rid] === "like") next.likes += 1;
                    if (myReactions[rid] === "dislike") next.dislikes += 1;
                    return next;
                })
            );
            saveReactions({ ...myReactions }); // sin el cambio
        }
    };

    // Permisos de borrado (autor o admin)
    const canDelete = (r: Review) => !!me && (isAdmin || me.id === r.user_id);

    const deleteReview = async (rid: number) => {
        const ok = await confirm("Borrar reseña", "Esta acción no se puede deshacer.", "Borrar");
        if (!ok) return;
        try {
            await apiDelete(`/reviews/${rid}`);

            // Si borraste la tuya, limpia el formulario
            const wasMine = reviews.find((r) => r.id === rid && r.user_id === me?.id);
            if (wasMine) {
                setMyRating(0);
                setComment("");
            }

            // Refresca métricas/lista
            const r = await fetchReviews(id as string);

            // Notifica al showcase para refrescar estrella y conteo
            window.dispatchEvent(
                new CustomEvent("reviews:changed", {
                    detail: { productId: Number(id), average: r.avg, count: r.count },
                })
            );

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
                    {/* IMAGEN */}
                    <Card className="overflow-hidden">
                        <img src={imgUrl} alt={p.nombre} className="w-full h-auto object-cover" />
                    </Card>

                    {/* INFO */}
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
                    {/* Form reseña */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-lg font-medium">Tu valoración</h3>

                            {!isLogged ? (
                                <p className="text-sm text-muted-foreground">Inicia sesión para dejar una reseña.</p>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <StarRating value={myRating} onChange={setMyRating} />
                                        <span className="text-sm text-muted-foreground">
                                            {myRating.toFixed(1)} / 5
                                        </span>
                                    </div>

                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Escribe tu opinión (opcional)…"
                                        rows={4}
                                    />

                                    <Button onClick={submitReview}>
                                        {hasMine ? "Actualizar reseña" : "Guardar reseña"}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lista reseñas */}
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
                                                <span className="text-xs text-muted-foreground">
                                                    · {r.user?.name ?? "Usuario"} · {new Date(r.created_at).toLocaleDateString()}
                                                </span>

                                                {/* Botón borrar si corresponde */}
                                                {canDelete(r) && (
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

                                            {r.comment && (
                                                <div className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
                                                    {r.comment}
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center gap-4">
                                                <button
                                                    className={`flex items-center gap-1 text-sm ${myReactions[r.id] === "like" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                    onClick={() => react(r.id, "like")}
                                                    title="Me gusta"
                                                >
                                                    👍 {r.likes}
                                                </button>
                                                <button
                                                    className={`flex items-center gap-1 text-sm ${myReactions[r.id] === "dislike" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                                        }`}
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
