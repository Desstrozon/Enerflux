import { useEffect, useState } from "react";
import { apiGet, apiPostForm, apiDelete, APP_BASE } from "@/lib/http";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { alertSuccess, alertError, confirm, toastSuccess } from "@/lib/alerts";

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  stock: number;
  id_vendedor?: number | null;
  vendedor_nombre?: string | null;
  imagen?: string | null;
  images?: { id?: number; path?: string; url?: string }[] | null;
  galeria?: string[] | null;
};

type Vendor = { id: number; name: string; rol?: string };

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);

  // ▼ vendedores para el selector
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [galeriaPreviewNuevos, setGaleriaPreviewNuevos] = useState<string[]>([]);
  const base = APP_BASE;

  const categorias = ["panel", "bateria", "inversor", "accesorio"];

  const refresh = async () => {
    setLoading(true);
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      const data = await apiGet<Producto[]>(`/productos${qs}`);
      setProductos(Array.isArray(data) ? data : (data as any).data ?? []);
    } catch {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // carga rápida de vendedores (intenta /users y filtra por rol vendedor)
  const loadVendors = async () => {
    try {
      const all = await apiGet<Vendor[]>("/users");
      const onlyVendors = (all || []).filter(
        (u) => String(u.rol || "").toLowerCase() === "vendedor"
      );
      setVendors(onlyVendors);
    } catch {
      setVendors([]); // si falla, mostramos input manual de id
    }
  };

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!cancelled) await refresh();
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const openNew = async () => {
    await loadVendors();
    setForm({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio_base: "",
      stock: "",
      id_vendedor: "",
      // características
      modelo_panel: "",
      eficiencia: "",
      superficie: "",
      produccion: "",
      modelo_bateria: "",
      capacidad: "",
      autonomia: "",
      // galería
      galeriaActual: [] as string[],
      galeriaFiles: [] as File[],
    });
    setPreview(null);
    setGaleriaPreviewNuevos([]);
    setShowForm(true);
  };

  const openEdit = async (row: Producto) => {
    try {
      await loadVendors();
      const full = await apiGet<Producto>(`/productos/${row.id_producto}`);
      setForm({
        id_producto: full.id_producto,
        nombre: full.nombre || "",
        descripcion: full.descripcion || "",
        categoria: full.categoria || "",
        precio_base: full.precio_base ?? "",
        stock: full.stock ?? "",
        id_vendedor: full.id_vendedor ?? "",
        // galería existente (acepta full.galeria o full.images)
        galeriaActual: Array.isArray(full.galeria)
          ? full.galeria
          : ((full.images ?? [])
            .map((im) => im?.path)
            .filter(Boolean) as string[]),
        galeriaFiles: [] as File[],
      });
      const img = full.imagen ? `${base}/storage/${full.imagen}` : "/default.png";
      setPreview(img);
      setGaleriaPreviewNuevos([]);
      setShowForm(true);
    } catch (e) {
      console.error(e);
      await alertError("No se pudo cargar el producto para editar.");
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("nombre", form.nombre || "");
      fd.append("descripcion", form.descripcion || "");
      fd.append("categoria", form.categoria || "");
      fd.append("precio_base", String(form.precio_base ?? 0));
      fd.append("stock", String(form.stock ?? 0));
      if (form.id_vendedor) fd.append("id_vendedor", String(form.id_vendedor));
      if (form.imagenFile) fd.append("imagen", form.imagenFile);

      if (form.categoria === "panel") {
        if (form.modelo_panel) fd.append("modelo_panel", form.modelo_panel);
        if (form.eficiencia != null) fd.append("eficiencia", String(form.eficiencia));
        if (form.superficie != null) fd.append("superficie", String(form.superficie));
        if (form.produccion != null) fd.append("produccion", String(form.produccion));
      }
      if (form.categoria === "bateria") {
        if (form.modelo_bateria) fd.append("modelo_bateria", form.modelo_bateria);
        if (form.capacidad != null) fd.append("capacidad", String(form.capacidad));
        if (form.autonomia != null) fd.append("autonomia", String(form.autonomia));
      }

      // ▼▼ GALERÍA ▼▼
      (form.galeriaActual as string[]).forEach((rel: string) => {
        fd.append("keep_galeria[]", rel);
      });
      (form.galeriaFiles as File[]).forEach((f) => {
        fd.append("galeria[]", f);
      });
      // ▲▲ GALERÍA ▲▲

      if (form.id_producto) {
        fd.append("_method", "PUT");
        await apiPostForm(`/productos/${form.id_producto}`, fd);
        toastSuccess("Producto actualizado");
      } else {
        await apiPostForm(`/productos`, fd);
        toastSuccess("Producto creado");
      }

      setShowForm(false);
      setForm({});
      setPreview(null);
      setGaleriaPreviewNuevos([]);
      await refresh();
    } catch (err: any) {
      await alertError(
        form.id_producto ? "Error al actualizar" : "Error al crear",
        err?.message || "Revisa los campos"
      );
    }
  }

  const removeExistingFromGallery = (rel: string) => {
    setForm((f: any) => ({
      ...f,
      galeriaActual: (f.galeriaActual as string[]).filter((p: string) => p !== rel),
    }));
  };

  const removeNewFromGallery = (idx: number) => {
    setForm((f: any) => ({
      ...f,
      galeriaFiles: (f.galeriaFiles as File[]).filter((_: File, i: number) => i !== idx),
    }));
    setGaleriaPreviewNuevos((arr) => arr.filter((_, i) => i !== idx));
  };

  async function handleDelete(id: number) {
    const ok = await confirm("Eliminar producto", "Esta acción no se puede deshacer.", "Sí, eliminar");
    if (!ok) return;
    try {
      await apiDelete(`/productos/${id}`);
      await alertSuccess("Producto eliminado");
      setProductos((p) => p.filter((x) => x.id_producto !== id));
    } catch (err: any) {
      await alertError("No se pudo eliminar", err?.message || "Inténtalo de nuevo");
    }
  }

  return (
    <main className="container mx-auto px-4" style={{ marginTop: 96 }}>
      <h1 className="text-2xl font-semibold mb-4">Productos</h1>
      <BackButton to="/admin" label="Volver al panel" />

      <div className="flex justify-between items-center mb-4 gap-3">
        <Input
          placeholder="Buscar producto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />

        <Dialog
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setForm({});
              setPreview(null);
              setGaleriaPreviewNuevos([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openNew}>Nuevo producto</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id_producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="grid gap-3 mt-2" encType="multipart/form-data">
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

              {/* ▼ Selector de vendedor (si hay datos) */}
              {vendors.length > 0 ? (
                <div>
                  <label className="text-sm font-medium">Vendedor</label>
                  <select
                    value={form.id_vendedor ?? ""}
                    onChange={(e) => setForm({ ...form, id_vendedor: Number(e.target.value) || "" })}
                    className="w-full border rounded p-2 bg-background"
                  >
                    <option value="">— Sin vendedor —</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (#{v.id})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input
                  type="number"
                  placeholder="ID vendedor (opcional)"
                  value={form.id_vendedor ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, id_vendedor: e.target.value === "" ? "" : parseInt(e.target.value) })
                  }
                />
              )}

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

              {/* características (igual que tenías) */}
              {form.categoria === "panel" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded p-3">
                  <div className="md:col-span-2 font-medium text-sm">Características del panel</div>
                  <Input placeholder="Modelo del panel" value={form.modelo_panel || ""} onChange={(e) => setForm({ ...form, modelo_panel: e.target.value })} />
                  <Input type="number" step="0.01" placeholder="Eficiencia (%)" value={form.eficiencia ?? ""} onChange={(e) => setForm({ ...form, eficiencia: e.target.value === "" ? "" : parseFloat(e.target.value) })} />
                  <Input type="number" step="0.01" placeholder="Superficie (m²)" value={form.superficie ?? ""} onChange={(e) => setForm({ ...form, superficie: e.target.value === "" ? "" : parseFloat(e.target.value) })} />
                  <Input type="number" step="0.01" placeholder="Producción (kWh/año)" value={form.produccion ?? ""} onChange={(e) => setForm({ ...form, produccion: e.target.value === "" ? "" : parseFloat(e.target.value) })} />
                </div>
              )}

              {form.categoria === "bateria" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded p-3">
                  <div className="md:col-span-2 font-medium text-sm">Características de la batería</div>
                  <Input placeholder="Modelo de la batería" value={form.modelo_bateria || ""} onChange={(e) => setForm({ ...form, modelo_bateria: e.target.value })} />
                  <Input type="number" step="0.01" placeholder="Capacidad (kWh)" value={form.capacidad ?? ""} onChange={(e) => setForm({ ...form, capacidad: e.target.value === "" ? "" : parseFloat(e.target.value) })} />
                  <Input type="number" step="0.01" placeholder="Autonomía (h)" value={form.autonomia ?? ""} onChange={(e) => setForm({ ...form, autonomia: e.target.value === "" ? "" : parseFloat(e.target.value) })} />
                </div>
              )}

              <Input
                type="number"
                placeholder="Precio base"
                value={form.precio_base ?? ""}
                onChange={(e) => setForm({ ...form, precio_base: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                required
              />
              <Input
                type="number"
                placeholder="Stock"
                value={form.stock ?? ""}
                onChange={(e) => setForm({ ...form, stock: e.target.value === "" ? "" : parseInt(e.target.value) })}
                required
              />

              {/* Imagen principal */}
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
                    <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
                    <img src={preview} alt="Previsualización" className="max-h-40 rounded border" />
                  </div>
                )}
              </div>

              {/* Galería */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Galería (múltiples imágenes)</label>

                {Array.isArray(form.galeriaActual) && form.galeriaActual.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {(form.galeriaActual as string[]).map((rel: string) => {
                      const url = `${base}/storage/${rel}`;
                      return (
                        <div key={rel} className="relative">
                          <img src={url} className="w-full h-24 object-cover rounded border" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded"
                            onClick={() => removeExistingFromGallery(rel)}
                            title="Quitar de la galería"
                          >
                            X
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    if (files.length) {
                      setForm((f: any) => ({
                        ...f,
                        galeriaFiles: [...(f.galeriaFiles as File[]), ...files],
                      }));
                      setGaleriaPreviewNuevos((prev) => [
                        ...prev,
                        ...files.map((f) => URL.createObjectURL(f)),
                      ]);
                    }
                  }}
                />
                {galeriaPreviewNuevos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {galeriaPreviewNuevos.map((u, i) => (
                      <div key={`${u}-${i}`} className="relative">
                        <img src={u} className="w-full h-24 object-cover rounded border" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-gray-700 text-white text-xs px-2 py-0.5 rounded"
                          onClick={() => removeNewFromGallery(i)}
                          title="Quitar imagen nueva"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit">{form.id_producto ? "Actualizar" : "Crear"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                // intentamos sacar una ruta/URL de imagen de varios sitios
                const relOrUrl =
                  p.imagen ||
                  (Array.isArray(p.images) && p.images.length
                    ? (p.images[0].path || p.images[0].url || "")
                    : "");

                const imgUrl = relOrUrl
                  ? relOrUrl.startsWith("http")
                    ? relOrUrl
                    : `${base}/storage/${relOrUrl
                      .replace(/^storage\//, "")
                      .replace(/^public\//, "")}`
                  : "/default.png";


                return (
                  <tr key={p.id_producto} className="border-t">
                    <td className="p-2">{p.id_producto}</td>
                    <td className="p-2">
                      {p.vendedor_nombre ?? (p as any).vendedor_name ?? p.id_vendedor ?? "—"}
                    </td>
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
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id_producto)}>Eliminar</Button>
                    </td>
                  </tr>
                );
              })}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-2 text-center text-muted-foreground">
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
