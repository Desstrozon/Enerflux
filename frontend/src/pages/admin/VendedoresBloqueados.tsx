import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiGet } from "@/lib/http";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";

type VendedorBloqueado = {
  id: number;
  name: string;
  email: string;
  blocked?: boolean;
  vendor_status?: string | null;
  telefono?: string | null;
  zona?: string | null;
  brand?: string | null;
};

export default function VendedoresBloqueados() {
  const [data, setData] = useState<VendedorBloqueado[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const users = await apiGet<any[]>("/users");
      
      // Filtrar solo vendedores bloqueados o rechazados
      const bloqueados = users.filter((u: any) => 
        u.rol === 'vendedor' && (u.blocked || u.vendor_status === 'rejected')
      );
      
      setData(bloqueados);
    } catch (e: any) {
      if (e.status === 401) {
        toast.error("Sesión expirada. Inicia sesión de nuevo.");
        navigate("/login", { replace: true });
      } else if (e.status === 403) {
        toast.error("Acceso restringido: solo administradores.");
        navigate("/", { replace: true });
      } else {
        toast.error(e.message ?? "Error al cargar vendedores bloqueados.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((u) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      String(u.id).includes(term)
    );
  });

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Cargando vendedores bloqueados…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Vendedores Bloqueados</h1>
          <BackButton to="/admin" label="Volver al inicio" />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email o ID…"
            className="max-w-md"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Zona</TableHead>
            <TableHead>Marca</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                {u.blocked && <span className="text-red-500">Bloqueado</span>}
                {u.vendor_status === 'rejected' && <span className="text-orange-500">Rechazado</span>}
              </TableCell>
              <TableCell>{u.telefono ?? "—"}</TableCell>
              <TableCell>{u.zona ?? "—"}</TableCell>
              <TableCell>{u.brand ?? "—"}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-sm text-muted-foreground"
              >
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
