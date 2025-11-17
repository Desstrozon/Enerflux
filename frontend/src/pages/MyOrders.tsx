import { useEffect, useState } from "react";
import { apiGet } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";

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

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

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
      const url = `${BASE}/orders/${orderId}/invoice.pdf`;
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

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Mis pedidos</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {orders.length === 0 ? (
        <>
          <p className="text-muted-foreground mb-4">No tienes pedidos todavía.</p>
          <BackButton to="/" label="Volver al inicio" />
        </>
      ) : (
        <div className="overflow-x-auto border rounded">
          <div className="p-3">
            <BackButton to="/" label="Volver al inicio" />
          </div>

          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString("es-ES", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">{money(o.amount ?? 0, o.currency ?? "EUR")}</td>
                  <td className="p-2">
                    <div className="flex gap-3">
                      <Link
                        to={`/checkout/success?session_id=${o.stripe_session_id}`}
                        className="underline"
                      >
                        Ver
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === o.id}
                        onClick={() => handleDownloadPdf(o.id)}
                      >
                        {downloadingId === o.id ? "Descargando…" : "Descargar PDF"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
