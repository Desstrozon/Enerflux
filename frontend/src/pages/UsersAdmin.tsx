import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// si usas shadcn/ui Table:
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type UserRow = { id: number; name: string; email: string; rol: string };

export default function UsersAdmin() {
  const [data, setData] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const users = await apiGet<UserRow[]>("/users");
        if (!mounted) return;
        setData(users);
      } catch (e: any) {
        if (e.status === 401) {
          toast.error("Sesión expirada. Inicia sesión de nuevo.");
          navigate("/login", { replace: true });
        } else if (e.status === 403) {
          toast.error("Acceso restringido: solo administradores.");
          navigate("/", { replace: true });
        } else {
          toast.error(e.message ?? "Error al cargar usuarios.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Cargando usuarios…</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuarios</h1>
        {/* futuro: botón Crear */}
        <Button variant="secondary" disabled>Nuevo (próximamente)</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell className="capitalize">{u.rol}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="outline" disabled>Editar</Button>
                <Button size="sm" variant="destructive" disabled>Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
          {(!data || data.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                No hay usuarios.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
