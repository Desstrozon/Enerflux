import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { alertError, alertSuccess } from "@/lib/alerts";
import { apiPostJson } from "@/lib/http";
import Footer from "@/components/Footer";

export default function EstudioPersonalizado() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const me = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const isLogged = !!me;

  const handleRequest = async () => {
    if (!isLogged) {
      await alertError(
        "Inicia sesión",
        "Debes iniciar sesión para solicitar un estudio personalizado."
      );
      navigate("/login");
      return;
    }

    if (sending) return;
    setSending(true);

    try {
      await apiPostJson("/study/request", {});
      await alertSuccess(
        "Solicitud enviada",
        "Hemos recibido tu solicitud. Revisa tu correo: te hemos enviado un estudio orientativo y próximos pasos."
      );
    } catch (err: any) {
      const msg =
        err?.message ||
        "No se pudo enviar la solicitud. Inténtalo de nuevo.";
      await alertError("Error al solicitar el estudio", msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background via-background to-background">
      {/* “luces” de fondo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 lg:py-24" style={{ marginTop: 96 }}>
        {/* 1 columna en móvil, 2 en pantallas grandes */}
        <div className="max-w-5xl mx-auto grid gap-10 lg:gap-12 lg:grid-cols-[1.1fr,0.9fr] items-start">
          {/* Texto principal */}
          <section>
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Estudio personalizado
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Diseñamos tu sistema solar a medida.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              Analizamos tu consumo, orientación de la vivienda y hábitos
              diarios para proponerte una instalación fotovoltaica optimizada:
              ni más paneles de los necesarios, ni menos.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              El servicio es totalmente <strong>gratuito</strong> y sin
              compromiso. Un técnico del equipo de Enerflux se pondrá en
              contacto contigo para hacerte unas preguntas rápidas (potencia
              contratada, facturas recientes, tipo de tejado, etc.) y, con esa
              información, elaboraremos un estudio con:
            </p>

            <ul className="text-base md:text-lg text-muted-foreground space-y-2 mb-8 list-disc pl-5">
              <li>Producción anual estimada y ahorro aproximado.</li>
              <li>Recomendación de número de paneles, inversor y batería.</li>
              <li>Propuesta orientativa de kit de autoconsumo.</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                size="lg"
                onClick={handleRequest}
                disabled={sending}
                className="px-8 text-base"
              >
                {sending
                  ? "Enviando solicitud..."
                  : "Solicitar estudio personalizado"}
              </Button>

              {!isLogged && (
                <p className="text-sm md:text-base text-muted-foreground">
                  Necesitas tener sesión iniciada.{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Inicia sesión
                  </button>{" "}
                  o{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    crea una cuenta
                  </button>
                  .
                </p>
              )}
            </div>
          </section>

          {/* Tarjetas laterales – AHORA visibles también en móvil (debajo del texto) */}
          <section className="space-y-3">
            <Card className="border-border/60 bg-background/70 backdrop-blur">
              <CardContent className="p-5">
                <p className="text-sm text-primary mb-2 font-semibold">
                  Resumen del estudio
                </p>
                <p className="text-base text-foreground">
                  Ahorro estimado:{" "}
                  <span className="font-semibold">
                    hasta 60% en tu factura
                  </span>
                  . Retorno medio de la inversión en{" "}
                  <span className="font-semibold">5-7 años</span>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/70 backdrop-blur">
              <CardContent className="p-5">
                <p className="text-sm text-primary mb-3 font-semibold">
                  ¿Qué analizamos?
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📈 Tu producción solar real, hora por hora.</p>
                  <p>☀️ La radiación solar específica de tu ubicación.</p>
                  <p>⚡ Cómo se comporta tu sistema bajo condiciones reales.</p>
                  <p>💾 Tu historial de consumo eléctrico.</p>
                  <p>Si puedes usar baterías para maximizar autoconsumo.</p>
                  <p className="pt-2 border-t border-border/40 italic text-xs">
                    Porque tu energía merece precisión.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/70 backdrop-blur">
              <CardContent className="p-5">
                <p className="text-sm text-primary mb-3 font-semibold">
                  Cómo lo hacemos
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Te instalamos un dispositivo real que mide tu producción
                    solar antes de invertir.
                  </p>
                  <p className="font-medium text-foreground text-sm">
                    No estimaciones. Un plan real.
                  </p>

                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                    <p className="font-medium text-foreground mb-2">
                      En 48 horas, recibes un informe claro:
                    </p>
                    <p>• Cuánto puedes ahorrar al año.</p>
                    <p>• Qué sistema realmente necesitas.</p>
                    <p>• Cuándo recuperas tu inversión.</p>
                  </div>

                  <p className="mt-3 pt-3 border-t border-border/40 italic">
                    Porque invertir en sol… no debe ser un juego de azar.
                  </p>
                  <p className="font-semibold text-primary">
                    Con EnerFlux, no adivinamos. Medimos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/70 backdrop-blur">
              <CardContent className="p-4 text-xs text-muted-foreground">
                *El estudio que recibirás por correo es orientativo y no supone
                una oferta comercial vinculante.
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
