import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// SweetAlert2 helpers
import { alertSuccess, alertError, confirm, toastSuccess } from "@/lib/alerts";

const API = import.meta.env.VITE_API_BASE_URL as string;
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  stock: number;
  id_vendedor?: number | null;
  imagen?: string | null;
};

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);

  const categorias = ["panel", "bateria", "inversor", "accesorio"];

  // --- helpers ---
  const refresh = async () => {
    setLoading(true);
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      const data = await apiGet<Producto[]>(`/productos${qs}`);
      setProductos(Array.isArray(data) ? data : (data as any).data ?? []);
    } catch (err) {
      console.error(err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!cancelled) await refresh();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // --- crear/editar ---
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre || "");
      formData.append("descripcion", form.descripcion || "");
      formData.append("categoria", form.categoria || "");
      formData.append("precio_base", String(form.precio_base ?? 0));
      formData.append("stock", String(form.stock ?? 0));
      if (form.id_vendedor) formData.append("id_vendedor", String(form.id_vendedor));
      if (form.imagenFile) formData.append("imagen", form.imagenFile);

      if (form.id_producto) {
        // Actualizar
        formData.append("_method", "PUT");
        await apiPost(`/productos/${form.id_producto}`, formData, true);
        toastSuccess("Producto actualizado");
      } else {
        // Crear
        await apiPost(`/productos`, formData, true);
        toastSuccess("Producto creado");
      }

      setShowForm(false);
      setForm({});
      setPreview(null);
      await refresh();
    } catch (err: any) {
      console.error("❌ Error detallado:", err);
      await alertError(
        form.id_producto ? "Error al actualizar" : "Error al crear",
        err?.message || "Revisa los campos e inténtalo de nuevo"
      );
    }
  }

  // --- eliminar ---
  async function handleDelete(id: number) {
    const ok = await confirm(
      "Eliminar producto",
      "Esta acción no se puede deshacer.",
      "Sí, eliminar"
    );
    if (!ok) return;

    try {
      await apiDelete(`/productos/${id}`);
      await alertSuccess("Producto eliminado");
      setProductos((p) => p.filter((x) => x.id_producto !== id));
    } catch (err: any) {
      console.error(err);
      await alertError("No se pudo eliminar", err?.message || "Inténtalo de nuevo");
    }
  }

  return (
    <main className="container mx-auto px-4" style={{ marginTop: 96 }}>
      <h1 className="text-2xl font-semibold mb-4">Productos</h1>
      <BackButton to="/admin" label="Volver al panel" />

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar producto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />

        {/* Dialog de creación/edición */}
        <Dialog
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setForm({});
              setPreview(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Nuevo producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {form.id_producto ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSave}
              className="grid gap-3 mt-2"
              encType="multipart/form-data"
            >
              <Input
                placeholder="Nombre"
                value={form.nombre || ""}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
              <Input
                placeholder="Descripción"
                value={form.descripcion || ""}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />

              {/* Selector de categoría */}
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <select
                  value={form.categoria || ""}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  required
                  className="w-full border rounded p-2 bg-background"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                type="number"
                placeholder="Precio base"
                value={form.precio_base ?? ""}
                onChange={(e) =>
                  setForm({ ...form, precio_base: parseFloat(e.target.value) })
                }
                required
              />
              <Input
                type="number"
                placeholder="Stock"
                value={form.stock ?? ""}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) })
                }
                required
              />

              {/* Subida de imagen + preview */}
              <div>
                <label className="text-sm font-medium">Imagen del producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      setForm({ ...form, imagenFile: file });
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {preview && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Vista previa:
                    </p>
                    <img
                      src={preview}
                      alt="Previsualización"
                      className="max-h-40 rounded border"
                    />
                  </div>
                )}
              </div>

              <Button type="submit">
                {form.id_producto ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div>Cargando…</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Vendedor</th>
                <th className="p-2 text-left">Imagen</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Categoría</th>
                <th className="p-2 text-left">Precio</th>
                <th className="p-2 text-left">Stock</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const imgUrl = p.imagen
                  ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/storage/${p.imagen}`
                  : "/default.png";

                return (
                  <tr key={p.id_producto} className="border-t">
                    <td className="p-2">{p.id_producto}</td>
                    <td className="p-2">{p.id_vendedor ?? "—"}</td>

                    <td className="p-2">
                      <img
                        src={imgUrl}
                        alt={p.nombre}
                        className="h-12 w-12 object-cover rounded border hover:scale-110 transition-transform"
                      />
                    </td>
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2">{p.categoria}</td>
                    <td className="p-2">{p.precio_base} €</td>
                    <td className="p-2">{p.stock}</td>
                    <td className="p-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setForm(p);
                          const fullUrl = p.imagen
                            ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/storage/${p.imagen}`
                            : "/default.png";
                          setPreview(fullUrl);
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id_producto)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {productos.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-2 text-center text-muted-foreground"
                  >
                    Sin resultados
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
