import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { confirm, alertSuccess, alertError } from "@/lib/alerts";
import BackButton from "@/components/BackButton";

type UserRow = { id: number; name: string; email: string; rol: string };

export default function UsersAdmin() {
  const [data, setData] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const users = await apiGet<UserRow[]>("/users");
      setData(users ?? []);
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
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await load(); })();
    return () => { mounted = false; };
  }, []);

  const handleEdit = (u: UserRow) => {
    navigate(`/admin/usuarios/${u.id}`, { state: { user: u } });
  };

  const handleDelete = async (u: UserRow) => {
    const ok = await confirm(
      "Eliminar usuario",
      `¿Seguro que quieres eliminar a “${u.name}”? Esta acción no se puede deshacer.`,
      "Eliminar"
    );
    if (!ok) return;

    try {
      setDeletingId(u.id);
      await apiDelete(`/users/${u.id}`);
      await alertSuccess("Usuario eliminado.");
      // refrescar lista
      await load();
    } catch (e) {
      console.error(e);
      await alertError("No se pudo eliminar el usuario.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Cargando usuarios…</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuarios</h1>
                <BackButton to="/admin" label="Volver al inicio" />
        
        {/* Activaremos esto cuando tengamos POST /users en el backend */}
        <Button
          variant="secondary"
          disabled
          title="Añadiremos creación cuando exista POST /users"
        >
          Nuevo (próximamente)
        </Button>
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
                <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(u)}
                  disabled={deletingId === u.id}
                >
                  {deletingId === u.id ? "Eliminando…" : "Eliminar"}
                </Button>
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
