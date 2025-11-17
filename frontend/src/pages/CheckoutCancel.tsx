import BackButton from "@/components/BackButton";

export default function CheckoutCancel() {
  return (
    <main className="container mx-auto py-24 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">Pago cancelado</h1>
      <p className="text-muted-foreground">Puedes revisarlo y volver a intentarlo cuando quieras.</p>
      <BackButton to="/" label="Volver al inicio" className="mt-6" />
    </main>
  );
}