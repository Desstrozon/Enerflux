import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/http"; 

type Order = {
  id: number;
  status: string;
  currency: string;
  amount?: number;  // tu migración usa 'amount'
  total?: number;   // por si en algún sitio guardaste 'total'
};

export default function CheckoutSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(search).get("session_id") || "";

  const [phase, setPhase] =
    useState<"fetching" | "processing" | "ready" | "error">("fetching");
  const [order, setOrder] = useState<Order | null>(null);

  // HTML de la factura para previsualización
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");

  useEffect(() => {
    if (!sessionId) {
      setPhase("error");
      return;
    }

    let cancelled = false;
    let tries = 0;

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const res = await fetch(
          `${API_BASE}/orders/by-session/${sessionId}`,
          {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        // 202 => aún procesando
        if (res.status === 202) {
          if (!cancelled) {
            setPhase("processing");
            if (tries < 10) {
              tries++;
              setTimeout(fetchOrder, 1500);
            } else {
              setPhase("error");
            }
          }
          return;
        }

        if (!res.ok) throw new Error(await res.text());

        const data = (await res.json()) as Order;
        if (!cancelled) {
          setOrder(data);
          setPhase("ready");
        }
      } catch {
        if (!cancelled) setPhase("error");
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    const loadInvoiceHtml = async () => {
      if (!order?.id) return;
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `${API_BASE}/orders/${order.id}/invoice`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) return;
        const html = await res.text();
        setInvoiceHtml(html);
      } catch {
        // ignoramos error silenciosamente
      }
    };
    loadInvoiceHtml();
  }, [order?.id]);

  // Descargar PDF
  const handleDownloadPdf = async () => {
    if (!order?.id) return;
    const token = localStorage.getItem("token") || "";

    const res = await fetch(
      `${API_BASE}/orders/${order.id}/invoice.pdf`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    if (!res.ok) return;

    const blob = await res.blob();
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `Factura-${order.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const formattedTotal = (() => {
    const raw = (order?.amount ?? order?.total ?? 0) as any;
    const num = typeof raw === "string" ? parseFloat(raw) : Number(raw || 0);
    const isNum = Number.isFinite(num) ? num : 0;
    return `${isNum.toFixed(2)} ${order?.currency ?? "EUR"}`;
  })();

  return (
    <main className="container max-w-3xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-2">Pago completado</h1>

      {phase === "fetching" || phase === "processing" ? (
        <>
          <p className="text-muted-foreground mb-6">
            Confirmando tu pedido… {phase === "processing" && "(casi listo)"}
          </p>
          <div className="h-2 w-48 bg-muted rounded overflow-hidden">
            <div className="h-full w-1/2 animate-pulse bg-primary/40" />
          </div>
        </>
      ) : phase === "error" ? (
        <>
          <p className="text-muted-foreground mb-6">
            No hemos podido encontrar el pedido todavía.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/")}>Seguir comprando</Button>
            <Button variant="outline" onClick={() => navigate("/mis-pedidos")}>
              Ver mis pedidos
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground mb-6">
            ¡Gracias! Tu pedido #{order?.id} está confirmado.
          </p>

          <div className="rounded-xl border p-4 mb-6 bg-white text-black dark:bg-neutral-900 dark:text-neutral-100">
            <div className="flex justify-between">
              <span>Estado</span>
              <span className="font-medium">{order?.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{formattedTotal}</span>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => navigate("/mis-pedidos")}>Ver mis pedidos</Button>
            {order && (
              <Button variant="outline" onClick={handleDownloadPdf}>
                Descargar PDF
              </Button>
            )}
          </div>

          {invoiceHtml && (
            <div
              className="rounded-xl border overflow-hidden bg-white"
              style={{ height: "70vh" }}
            >
              <iframe
                title="Factura"
                srcDoc={invoiceHtml}
                style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
