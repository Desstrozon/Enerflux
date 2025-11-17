import { apiPostJson } from "@/lib/http";
import { alertError } from "@/lib/alerts";

export async function startCheckout(): Promise<void> {
  try {
    // tu backend devuelve { id, url }
    const res = await apiPostJson<{ id: string; url: string }>("/checkout/sessions", {});
    if (!res?.url) throw new Error("No se recibió la URL de Stripe.");
    // Redirige al Checkout de Stripe
    window.location.href = res.url;
  } catch (err: any) {
    await alertError("No se pudo iniciar el pago", err?.message || "Inténtalo de nuevo.");
    throw err;
  }
}