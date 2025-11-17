import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";

type UserRow = { id: number; name: string; email: string; rol: string };

export default function UsersAdmin() {
  const [data, setData] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<any>(null); // usuario en edición
  const navigate = useNavigate();

  const load = async () => {
    try {
      const users = await apiGet<UserRow[]>("/users");
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
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = async (u: UserRow) => {
    try {
      // si quieres traer perfiles asociados, podrías pegar aquí un GET /users/{id}
      setCurrent({
        id: u.id,
        name: u.name,
        email: u.email,
        rol: u.rol,
        telefono: "",
        zona: "",
        direccion: "",
      });
      setOpen(true);
    } catch (e: any) {
      toast.error(e.message ?? "No se pudo abrir la edición");
    }
  };

  const onChange = (k: string, v: any) => setCurrent((c: any) => ({ ...c, [k]: v }));

  const onSave = async () => {
    if (!current) return;
    try {
      setSaving(true);
      const body: any = {
        name: current.name,
        email: current.email,
        rol: current.rol,
      };

      // si el rol es vendedor, mandamos zona/telefono; si es cliente, direccion/telefono
      if ((current.rol || "").toLowerCase() === "vendedor") {
        body.telefono = current.telefono ?? "";
        body.zona = current.zona ?? "";
      } else if ((current.rol || "").toLowerCase() === "cliente") {
        body.telefono = current.telefono ?? "";
        body.direccion = current.direccion ?? "";
      }

      await apiPut(`/users/${current.id}`, body);
      toast.success("Usuario actualizado");
      setOpen(false);
      setCurrent(null);
      load(); // refrescar tabla
    } catch (e: any) {
      toast.error(e.message ?? "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Cargando usuarios…</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton to="/admin" label="Volver" />
          <h1 className="text-xl font-semibold">Usuarios</h1>
        </div>
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
                <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Editar</Button>
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

      {/* Modal edición */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar usuario</DialogTitle></DialogHeader>

          {current && (
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-sm">Nombre</Label>
                <Input value={current.name || ""} onChange={(e) => onChange("name", e.target.value)} />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <Input type="email" value={current.email || ""} onChange={(e) => onChange("email", e.target.value)} />
              </div>
              <div>
                <Label className="text-sm">Rol</Label>
                <Input value={current.rol || ""} onChange={(e) => onChange("rol", e.target.value)} placeholder="admin | vendedor | cliente" />
              </div>

              {(current.rol || "").toLowerCase() === "vendedor" && (
                <>
                  <div>
                    <Label className="text-sm">Teléfono (vendedor)</Label>
                    <Input value={current.telefono || ""} onChange={(e) => onChange("telefono", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Zona</Label>
                    <Input value={current.zona || ""} onChange={(e) => onChange("zona", e.target.value)} />
                  </div>
                </>
              )}

              {(current.rol || "").toLowerCase() === "cliente" && (
                <>
                  <div>
                    <Label className="text-sm">Teléfono (cliente)</Label>
                    <Input value={current.telefono || ""} onChange={(e) => onChange("telefono", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Dirección</Label>
                    <Input value={current.direccion || ""} onChange={(e) => onChange("direccion", e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {/* “Volver”/Cancelar: cierra sin cambios */}
            <Button variant="outline" onClick={() => setOpen(false)}>Volver</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
