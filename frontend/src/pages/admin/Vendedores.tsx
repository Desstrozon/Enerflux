import { useEffect, useMemo, useState } from "react";
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

type Vendedor = { 
  id: number; 
  name: string; 
  email: string; 
  rol: string;
  blocked?: boolean;
  vendor_status?: string | null;
  telefono?: string | null;
  zona?: string | null;
  brand?: string | null;
};

export default function VendedoresAdmin() {
  const [data, setData] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const users = await apiGet<any[]>("/users");
      
      // Filtrar solo vendedores aprobados (no bloqueados, no rechazados, no pendientes)
      const vendedores = users.filter((u: any) => 
        u.rol === 'vendedor' && 
        !u.blocked && 
        u.vendor_status !== 'rejected' &&
        u.vendor_status !== 'pending'
      );
      
      setData(vendedores);
    } catch (e: any) {
      if (e.status === 401) {
        toast.error("Sesión expirada. Inicia sesión de nuevo.");
        navigate("/login", { replace: true });
      } else if (e.status === 403) {
        toast.error("Acceso restringido: solo administradores.");
        navigate("/", { replace: true });
      } else {
        toast.error(e.message ?? "Error al cargar vendedores.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((u) =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      String(u.id).includes(term)
    );
  }, [data, q]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Cargando vendedores…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Vendedores</h1>
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
            <TableHead>Teléfono</TableHead>
            <TableHead>Zona</TableHead>
            <TableHead>Marca</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.id}</TableCell>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.email}</TableCell>
              <TableCell>{v.telefono ?? "—"}</TableCell>
              <TableCell>{v.zona ?? "—"}</TableCell>
              <TableCell>{v.brand ?? "—"}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
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
