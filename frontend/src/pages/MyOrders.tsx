import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileDown, Eye } from "lucide-react";

import { apiGet, API_BASE } from "@/lib/http";   //
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";

type OrderItem = {
  id: number;
  producto_id: number;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  currency: string;
  amount: number;
  items?: OrderItem[];
  stripe_session_id: string;
};

const money = (val: any, currency = "EUR") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(
    Number.isFinite(Number(val)) ? Number(val) : 0
  );

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await apiGet<any>("/orders/mine");
        const list = res?.data ?? res;
        setOrders(Array.isArray(list) ? list : []);
      } catch (e: any) {
        console.error(e);
        setError("No se pudieron cargar tus pedidos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDownloadPdf(orderId: number) {
    try {
      setDownloadingId(orderId);

      // 👇 usamos API_BASE en vez de montar BASE a mano
      const url = `${API_BASE}/orders/${orderId}/invoice.pdf`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Descarga denegada (HTTP ${res.status}).`);
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `Factura-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 1500);
    } catch (e) {
      console.error(e);
      alert(
        "No se pudo descargar la factura. Asegúrate de estar logueado y vuelve a intentarlo."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  const renderStatus = (status: string) => {
    const s = (status || "").toLowerCase();
    let label = status;
    let classes =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border";

    if (s === "paid" || s === "completed") {
      label = "Pagado";
      classes +=
        " bg-emerald-500/10 text-emerald-400 border-emerald-500/40";
    } else if (s === "pending") {
      label = "Pendiente";
      classes += " bg-amber-500/10 text-amber-400 border-amber-500/40";
    } else if (s === "canceled") {
      label = "Cancelado";
      classes += " bg-rose-500/10 text-rose-400 border-rose-500/40";
    } else {
      classes += " bg-muted/50 text-muted-foreground border-border/60";
    }

    return <span className={classes}>{label}</span>;
  };

  if (loading) {
    return (
      <main
        className="container mx-auto px-4 flex items-center justify-center"
        style={{ marginTop: 96 }}
      >
        <div className="text-sm text-muted-foreground">
          Cargando tus pedidos…
        </div>
      </main>
    );
  }

  return (
    <main
      className="container mx-auto px-4 pb-12"
      style={{ marginTop: 96 }}
    >
      {/* Cabecera responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Mis pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Consulta el historial de compras y descarga tus facturas.
          </p>
        </div>
        <BackButton to="/" label="Volver al inicio" />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <Card className="border-border/60 bg-background/70 backdrop-blur">
          <CardContent className="py-8 flex flex-col items-center text-center gap-3">
            <p className="text-base font-medium">
              Todavía no has realizado ningún pedido.
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Cuando compres algún producto, verás aquí el historial junto con
              las facturas descargables.
            </p>
            <Button className="mt-2" asChild>
              <Link to="/?scroll=productos">Ir a productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 rounded-xl border border-border/60 bg-background/70 backdrop-blur shadow-sm">
          {/* Contenedor scroll horizontal */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-3 text-left w-16">#</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right w-56">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr
                    key={o.id}
                    className="border-t border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 align-middle text-xs text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="p-3 align-middle">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString("es-ES", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td className="p-3 align-middle">
                      {renderStatus(o.status)}
                    </td>
                    <td className="p-3 align-middle text-right font-medium">
                      {money(o.amount ?? 0, o.currency ?? "EUR")}
                    </td>
                    <td className="p-3 align-middle">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="gap-1"
                        >
                          <Link
                            to={`/checkout/success?session_id=${o.stripe_session_id}`}
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={downloadingId === o.id}
                          onClick={() => handleDownloadPdf(o.id)}
                        >
                          <FileDown className="h-4 w-4" />
                          {downloadingId === o.id
                            ? "Descargando…"
                            : "Descargar PDF"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
