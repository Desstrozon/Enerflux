// src/pages/admin/Users.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { apiGet, apiPutJson, apiPostJson, apiDelete } from "@/lib/http";


import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { confirm, alertSuccess, alertError } from "@/lib/alerts";
import BackButton from "@/components/BackButton";

// ====== Tipos que vienen del backend (UserController@index) ======
type UserRow = {
  id: number;
  name: string;
  email: string;
  rol: string;

  // perfil cliente (aplanado)
  telefono?: string | null;
  direccion?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;

  // perfil vendedor extra
  zona?: string | null;
  brand?: string | null;
  company?: string | null;
  website?: string | null;
  message?: string | null;
};

// Lo que edita el admin en el formulario
type UserForm = {
  name: string;
  email: string;
  rol: string;
  password: string; // nueva contraseña opcional

  telefono: string;
  direccion: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;

  // vendedor
  zona: string;
  brand: string;
  company: string;
  website: string;
  message: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  rol: "cliente",
  password: "",
  telefono: "",
  direccion: "",
  address_line1: "",
  address_line2: "",
  city: "",
  province: "",
  postal_code: "",
  country: "",
  zona: "",
  brand: "",
  company: "",
  website: "",
  message: "",
};

const roles = ["admin", "administrador", "vendedor", "cliente"];

export default function UsersAdmin() {
  const [data, setData] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // búsqueda local
  const [q, setQ] = useState("");

  // edición
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // creación
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UserForm>(emptyForm);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  // ==========================
  // Carga inicial
  // ==========================
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
    (async () => {
      if (mounted) await load();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ==========================
  // Filtro en cliente
  // ==========================
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((u) =>
      (u.name?.toLowerCase().includes(term)) ||
      (u.email?.toLowerCase().includes(term)) ||
      (u.rol?.toLowerCase().includes(term)) ||
      String(u.id).includes(term)
    );
  }, [data, q]);

  // ==========================
  // EDICIÓN
  // ==========================
  const handleEditOpen = (u: UserRow) => {
    setEditUser(u);
    setEditForm({
      name: u.name ?? "",
      email: u.email ?? "",
      rol: u.rol ?? "cliente",
      password: "",
      telefono: u.telefono ?? "",
      direccion: u.direccion ?? "",
      address_line1: u.address_line1 ?? "",
      address_line2: u.address_line2 ?? "",
      city: u.city ?? "",
      province: u.province ?? "",
      postal_code: u.postal_code ?? "",
      country: u.country ?? "",
      zona: u.zona ?? "",
      brand: u.brand ?? "",
      company: u.company ?? "",
      website: u.website ?? "",
      message: u.message ?? "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setSaving(true);

      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        rol: editForm.rol,
        telefono: editForm.telefono || null,
      };

      // contraseña opcional
      if (editForm.password.trim() !== "") {
        payload.password = editForm.password;
      }

      // según rol añadimos los campos correctos
      if (editForm.rol === "cliente") {
        payload.direccion = editForm.direccion ?? "";
        payload.address_line1 = editForm.address_line1 || null;
        payload.address_line2 = editForm.address_line2 || null;
        payload.city = editForm.city || null;
        payload.province = editForm.province || null;
        payload.postal_code = editForm.postal_code || null;
        payload.country = editForm.country || null;
      } else if (editForm.rol === "vendedor") {
        payload.zona = editForm.zona || null;
        payload.brand = editForm.brand || null;
        payload.company = editForm.company || null;
        payload.website = editForm.website || null;
        payload.message = editForm.message || null;
      }

      await apiPutJson(`/users/${editUser.id}`, payload);

      await alertSuccess("Usuario actualizado.");
      setEditUser(null);
      setEditForm(emptyForm);
      await load();
    } catch (err: any) {
      console.error(err);
      await alertError(
        err?.response?.data?.message ||
        "No se pudo actualizar el usuario."
      );
    } finally {
      setSaving(false);
    }
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
    await load();
  } catch (e: any) {
    console.error(e);
    await alertError(e?.message || "No se pudo eliminar el usuario.");
  } finally {
    setDeletingId(null);
  }
};




  // ==========================
  // CREACIÓN
  // ==========================
  const openCreate = () => {
    setCreateForm({
      ...emptyForm,
      rol: "cliente",
    });
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);

      const payload: any = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        rol: createForm.rol,
        telefono: createForm.telefono || null,
      };

      if (createForm.rol === "cliente") {
        payload.direccion = createForm.direccion ?? "";
        payload.address_line1 = createForm.address_line1 || null;
        payload.address_line2 = createForm.address_line2 || null;
        payload.city = createForm.city || null;
        payload.province = createForm.province || null;
        payload.postal_code = createForm.postal_code || null;
        payload.country = createForm.country || null;
      } else if (createForm.rol === "vendedor") {
        payload.zona = createForm.zona || null;
        payload.brand = createForm.brand || null;
        payload.company = createForm.company || null;
        payload.website = createForm.website || null;
        payload.message = createForm.message || null;
      }

      await apiPostJson("/users", payload);

      await alertSuccess("Usuario creado correctamente.");
      setCreateOpen(false);
      setCreateForm(emptyForm);
      await load();
    } catch (err: any) {
      console.error(err);
      await alertError(
        err?.response?.data?.message ||
        "No se pudo crear el usuario. Revisa los datos."
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================
  // RENDER
  // ==========================
  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Cargando usuarios…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Usuarios</h1>
          <BackButton to="/admin" label="Volver al inicio" />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email, rol o ID…"
            className="max-w-md"
          />
          <Button variant="secondary" onClick={openCreate}>
            Nuevo usuario
          </Button>
        </div>
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
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell className="capitalize">{u.rol}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditOpen(u)}
                >
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
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground"
              >
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ========== MODAL EDICIÓN ========== */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>

          {editUser && (
            <form className="grid gap-4 pb-2" onSubmit={handleUpdate}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Correo</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Rol (no editable)</label>
                <Input
                  value={editForm.rol}
                  disabled
                  className="capitalize bg-muted cursor-not-allowed"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Nueva contraseña (opcional)
                </label>
                <Input
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Déjalo vacío para no cambiarla"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={editForm.telefono}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, telefono: e.target.value }))
                  }
                />
              </div>

              {/* === BLOQUE DIRECCIÓN CLIENTE (igual que Mi Perfil) === */}
              {editForm.rol === "cliente" && (
                <>
                  <div className="grid gap-2 pt-2 border-t border-border/50">
                    <h3 className="text-sm font-semibold">
                      Dirección de envío (cliente)
                    </h3>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Dirección (texto libre)
                    </label>
                    <Input
                      value={editForm.direccion}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          direccion: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Línea 1</label>
                    <Input
                      value={editForm.address_line1}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          address_line1: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Línea 2</label>
                    <Input
                      value={editForm.address_line2}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          address_line2: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Ciudad</label>
                      <Input
                        value={editForm.city}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Provincia / Región
                      </label>
                      <Input
                        value={editForm.province}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            province: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Código postal
                      </label>
                      <Input
                        value={editForm.postal_code}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            postal_code: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">País</label>
                      <Input
                        value={editForm.country}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            country: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* === BLOQUE VENDEDOR (si algún usuario lo usa) === */}
              {editForm.rol === "vendedor" && (
                <>
                  <div className="grid gap-2 pt-2 border-t border-border/50">
                    <h3 className="text-sm font-semibold">
                      Datos de vendedor
                    </h3>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Zona</label>
                    <Input
                      value={editForm.zona}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, zona: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Marca</label>
                      <Input
                        value={editForm.brand}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, brand: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Empresa</label>
                      <Input
                        value={editForm.company}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            company: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={editForm.website}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          website: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Mensaje / Notas
                    </label>
                    <Input
                      value={editForm.message}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          message: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditUser(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Actualizar"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== MODAL CREACIÓN ========== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>

          <form className="grid gap-4 pb-2" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Correo</label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Rol</label>
              <select
                className="w-full border rounded p-2 bg-background capitalize"
                value={createForm.rol}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, rol: e.target.value }))
                }
                required
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={createForm.telefono}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, telefono: e.target.value }))
                }
              />
            </div>

            {createForm.rol === "cliente" && (
              <>
                <div className="grid gap-2 pt-2 border-t border-border/50">
                  <h3 className="text-sm font-semibold">
                    Dirección de envío (cliente)
                  </h3>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Dirección (texto libre)
                  </label>
                  <Input
                    value={createForm.direccion}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        direccion: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Línea 1</label>
                  <Input
                    value={createForm.address_line1}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        address_line1: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Línea 2</label>
                  <Input
                    value={createForm.address_line2}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        address_line2: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <Input
                      value={createForm.city}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Provincia / Región
                    </label>
                    <Input
                      value={createForm.province}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          province: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Código postal
                    </label>
                    <Input
                      value={createForm.postal_code}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          postal_code: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">País</label>
                    <Input
                      value={createForm.country}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          country: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {createForm.rol === "vendedor" && (
              <>
                <div className="grid gap-2 pt-2 border-t border-border/50">
                  <h3 className="text-sm font-semibold">
                    Datos de vendedor
                  </h3>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Zona</label>
                  <Input
                    value={createForm.zona}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, zona: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Marca</label>
                    <Input
                      value={createForm.brand}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          brand: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Empresa</label>
                    <Input
                      value={createForm.company}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          company: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={createForm.website}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        website: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Mensaje / Notas
                  </label>
                  <Input
                    value={createForm.message}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        message: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creando…" : "Crear usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
