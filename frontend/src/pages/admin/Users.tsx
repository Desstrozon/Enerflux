import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import BackButton from "@/components/BackButton";

type PerfilCliente = { telefono?: string | null; direccion?: string | null };
type PerfilVendedor = { telefono?: string | null; zona?: string | null };

type User = {
  id: number;
  name: string;
  email: string;
  rol: string;
  perfil_cliente?: PerfilCliente;
  perfil_vendedor?: PerfilVendedor;
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const qs = q ? `?q=${encodeURIComponent(q)}` : "";
        const data = await apiGet<User[]>(`/users${qs}`);
        if (!cancelled) setUsers(Array.isArray(data) ? data : (data as any).data ?? []);
      } catch (e) {
        if (!cancelled) setUsers([]);
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const t = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <main className="container mx-auto px-4" style={{ marginTop: 96 }}>
      <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>
      <BackButton to="/admin" label="Volver al panel" />

      <input
        placeholder="Buscar por nombre, email o rol"
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
                <th className="text-left p-2">Rol</th>
                <th className="text-left p-2">Teléfono</th>
                <th className="text-left p-2">Zona/Dirección</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 capitalize">{u.rol}</td>
                  <td className="p-2">
                    {u.rol === "vendedor"
                      ? u.perfil_vendedor?.telefono ?? "—"
                      : u.perfil_cliente?.telefono ?? "—"}
                  </td>
                  <td className="p-2">
                    {u.rol === "vendedor"
                      ? u.perfil_vendedor?.zona ?? "—"
                      : u.perfil_cliente?.direccion ?? "—"}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="p-2" colSpan={6}>
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
