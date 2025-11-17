import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import BackButton from "@/components/BackButton";

type PerfilVend = { telefono?: string | null; zona?: string | null };
type Vendedor = { id: number; name: string; email: string; rol: string; perfil_vendedor?: PerfilVend };

export default function VendedoresAdmin() {
  const [rows, setRows] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const qs = q ? `?q=${encodeURIComponent(q)}` : "";
        const data = await apiGet<Vendedor[]>(`/vendedores${qs}`);
        if (!cancelled) setRows(Array.isArray(data) ? data : (data as any).data ?? []);
      } catch (e) {
        if (!cancelled) setRows([]);
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const t = setTimeout(load, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <main className="container mx-auto px-4" style={{ marginTop: 96 }}>
      <h1 className="text-2xl font-semibold mb-4">Vendedores</h1>
      <BackButton to="/admin" label="Volver al panel" />

      <input
        placeholder="Buscar por nombre o email"
        className="border rounded px-3 py-2 mb-4 w-full max-w-md bg-background text-white placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading ? (
        <div>Cargando…</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Teléfono</th>
                <th className="text-left p-2">Zona</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(v => (
                <tr key={v.id} className="border-t">
                  <td className="p-2">{v.id}</td>
                  <td className="p-2">{v.name}</td>
                  <td className="p-2">{v.email}</td>
                  <td className="p-2">{v.perfil_vendedor?.telefono ?? "—"}</td>
                  <td className="p-2">{v.perfil_vendedor?.zona ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2" colSpan={5}>Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
