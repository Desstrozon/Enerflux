import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { alertSuccess, alertError, confirm } from "@/lib/alerts";
import { apiGet, apiPut } from "@/lib/api";
import { Loader2, Lock, Save, Undo2 } from "lucide-react";
import BackButton from "@/components/BackButton";

/* ======================
   Tipos
====================== */
type Rol = "admin" | "administrador" | "vendedor" | "cliente";

type Me = {
  id: number;
  name: string;
  email: string;
  rol: Rol;
  perfilVendedor?: { telefono?: string | null; zona?: string | null } | null;
  perfilCliente?: {
    telefono?: string | null;
    direccion?: string | null; // <- lo que guarda tu backend
  } | null;
};

/* ======================
   Países (estilo Stripe)
====================== */
const COUNTRIES = [
  { value: "ES", label: "España" },
  { value: "PT", label: "Portugal" },
  { value: "FR", label: "Francia" },
  { value: "IT", label: "Italia" },
  { value: "DE", label: "Alemania" },
  { value: "GB", label: "Reino Unido" },
  { value: "IE", label: "Irlanda" },
  { value: "US", label: "Estados Unidos" },
  { value: "MX", label: "México" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "BR", label: "Brasil" },
  { value: "RU", label: "Rusia" },
];

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  // Form principal
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    telefono: "",
    direccion: "",     // texto libre (lo que guarda la API)
    // normalizados (solo front, para componer "direccion")
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal_code: "",
    country: "ES",
    // solo vendedor
    zona: "",
  });

  // Password modal
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd, setPwd] = useState({ current_password: "", password: "", password_confirmation: "" });

  const isVendedor = useMemo(() => (me?.rol || "").toLowerCase() === "vendedor", [me?.rol]);
  const isCliente = useMemo(() => (me?.rol || "").toLowerCase() === "cliente", [me?.rol]);

  /* -------- load /me -------- */
  useEffect(() => {
    (async () => {
      try {
        let data: Me | null = null;
        try { data = await apiGet<Me>("/me"); } catch { /* fallback */ }
        if (!data) {
          const raw = localStorage.getItem("user");
          data = raw ? JSON.parse(raw) : null;
        }
        if (!data) throw new Error("No hay sesión");

        setMe(data);
        setForm((f: any) => ({
          ...f,
          name: data.name ?? "",
          email: data.email ?? "",
          telefono: data.perfilVendedor?.telefono ?? data.perfilCliente?.telefono ?? "",
          direccion: data.perfilCliente?.direccion ?? "",
          zona: data.perfilVendedor?.zona ?? "",
          line1: "",
          line2: "",
          city: "",
          region: "",
          postal_code: "",
          country: f.country || "ES",
        }));
      } catch {
        await alertError("No se pudo cargar tu perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  /* -------- compone dirección si no hay texto libre -------- */
  const composeAddress = () => {
    if (form.direccion && form.direccion.trim().length > 0) {
      return form.direccion.trim();
    }
    const parts = [
      form.line1?.trim(),
      form.line2?.trim(),
      [form.postal_code, form.city].filter(Boolean).join(" "),
      form.region?.trim(),
      form.country?.trim(),
    ].filter(Boolean);
    return parts.join(" · ");
  };

  /* -------- Guardar -------- */
  const onSave = async () => {
    try {
      setSaving(true);

      const direccionTexto = composeAddress();

      const body: any = {
        name: form.name,
        email: form.email,
      };

      if (isVendedor) {
        body.telefono = form.telefono ?? "";
        body.zona = form.zona ?? "";
      } else if (isCliente) {
        body.telefono = form.telefono ?? "";
        body.direccion = direccionTexto; // 👈 único campo que persiste en tu backend
      }

      try {
        await apiPut("/me", body);
      } catch {
        if (me?.id) await apiPut(`/users/${me.id}`, body);
        else throw new Error("No hay ID de usuario");
      }

      // refresh cache local
      const next = { ...(me as any) };
      next.name = body.name;
      next.email = body.email;
      if (isVendedor) {
        next.perfilVendedor = { ...(me?.perfilVendedor || {}), telefono: body.telefono, zona: body.zona };
      } else if (isCliente) {
        next.perfilCliente = { ...(me?.perfilCliente || {}), telefono: body.telefono, direccion: body.direccion };
      }
      setMe(next);
      localStorage.setItem("user", JSON.stringify(next));
      window.dispatchEvent(new Event("auth:changed"));

      await alertSuccess("Perfil actualizado");
    } catch (e: any) {
      await alertError(e?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  /* -------- Cancelar -------- */
  const onCancel = async () => {
    if (!me) return;
    const ok = await confirm("Cancelar cambios", "Se perderán los cambios no guardados.", "Descartar");
    if (!ok) return;
    setForm({
      name: me.name ?? "",
      email: me.email ?? "",
      telefono: me.perfilVendedor?.telefono ?? me.perfilCliente?.telefono ?? "",
      direccion: me.perfilCliente?.direccion ?? "",
      zona: me.perfilVendedor?.zona ?? "",
      line1: "",
      line2: "",
      city: "",
      region: "",
      postal_code: "",
      country: "ES",
    });
  };

  /* -------- Cambiar contraseña -------- */
  const onChangePassword = async () => {
    try {
      if (!pwd.current_password || !pwd.password || !pwd.password_confirmation) {
        await alertError("Rellena todas las contraseñas.");
        return;
      }
      if (pwd.password !== pwd.password_confirmation) {
        await alertError("La confirmación no coincide.");
        return;
      }
      await apiPut("/me/password", pwd);
      setPwdOpen(false);
      setPwd({ current_password: "", password: "", password_confirmation: "" });
      await alertSuccess("Contraseña actualizada");
    } catch (e: any) {
      await alertError(e?.message || "No se pudo cambiar la contraseña");
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando tu perfil…
        </div>
      </main>
    );
  }

  // 👇 padding-top alto para que no lo tape el navbar fijo, y padding-bottom para la barra sticky
  return (
    <main className="container mx-auto px-4 pt-24 pb-28">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tus datos personales, contacto y dirección de envío.
        </p>
        <div className="mt-4">
          <BackButton to="/" label="Volver al inicio" />
        </div>
      </div>

      {/* Tarjeta única */}
      <Card className="rounded-2xl border bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Sección: Cuenta */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Cuenta</h2>
                <p className="text-xs text-muted-foreground">
                  Información básica de tu cuenta.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPwdOpen(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Cambiar contraseña
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={form.name || ""}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Tu nombre"
                  className="min-h-11 leading-[1.25]"
                />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="min-h-11 leading-[1.25]"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Sección: Contacto */}
          <div className="mb-6">
            <h2 className="text-lg font-medium">Contacto</h2>
            <p className="text-xs text-muted-foreground">
              Rol: <span className="font-medium text-foreground">{me?.rol}</span>
            </p>

            <div className="mt-4 grid gap-4 sm:max-w-md">
              <div>
                <Label className="text-xs">Teléfono</Label>
                <Input
                  value={form.telefono || ""}
                  onChange={(e) => onChange("telefono", e.target.value)}
                  placeholder="Ej. 600 000 000"
                  className="min-h-11 leading-[1.25]"
                />
              </div>

              {isVendedor && (
                <div>
                  <Label className="text-xs">Zona (vendedor)</Label>
                  <Input
                    value={form.zona || ""}
                    onChange={(e) => onChange("zona", e.target.value)}
                    placeholder="Ej. Almería y Granada"
                    className="min-h-11 leading-[1.25]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sección: Dirección (solo cliente) */}
          {isCliente && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h2 className="text-lg font-medium">Dirección de envío</h2>
                <p className="text-xs text-muted-foreground">
                  Si dejas vacía la dirección en texto libre, la construiremos con los campos de abajo.
                </p>

                <div className="mt-4 grid gap-4">
                  <div>
                    <Label className="text-xs">Dirección (texto libre)</Label>
                    <Input
                      value={form.direccion || ""}
                      onChange={(e) => onChange("direccion", e.target.value)}
                      placeholder="C/ Renovable, 123 · 04001 Almería"
                      className="min-h-11 leading-[1.25]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Linea 1</Label>
                      <Input
                        value={form.line1 || ""}
                        onChange={(e) => onChange("line1", e.target.value)}
                        placeholder="C/ Renovable, 123"
                        className="min-h-11 leading-[1.25]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs">Linea 2</Label>
                      <Input
                        value={form.line2 || ""}
                        onChange={(e) => onChange("line2", e.target.value)}
                        placeholder="Piso, puerta, escalera…"
                        className="min-h-11 leading-[1.25]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Ciudad</Label>
                      <Input
                        value={form.city || ""}
                        onChange={(e) => onChange("city", e.target.value)}
                        placeholder="Almería"
                        className="min-h-11 leading-[1.25]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Provincia / Región</Label>
                      <Input
                        value={form.region || ""}
                        onChange={(e) => onChange("region", e.target.value)}
                        placeholder="Almería"
                        className="min-h-11 leading-[1.25]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Código Postal</Label>
                      <Input
                        value={form.postal_code || ""}
                        onChange={(e) => onChange("postal_code", e.target.value)}
                        placeholder="04001"
                        className="min-h-11 leading-[1.25]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">País</Label>
                      <Select
                        value={form.country || "ES"}
                        onValueChange={(v) => onChange("country", v)}
                      >
                        <SelectTrigger className="min-h-11">
                          <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* FOOTER acciones fijo dentro de la tarjeta */}
          <div className="sticky bottom-0 -mx-6 mt-8 border-t bg-card/80 px-6 py-4 backdrop-blur z-10">
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onCancel} className="h-9">
                <Undo2 className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={onSave} disabled={saving} className="h-9">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo: cambiar contraseña */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Cambiar contraseña</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Contraseña actual</Label>
              <Input
                type="password"
                value={pwd.current_password}
                onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Nueva contraseña</Label>
              <Input
                type="password"
                value={pwd.password}
                onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Confirmar nueva contraseña</Label>
              <Input
                type="password"
                value={pwd.password_confirmation}
                onChange={(e) => setPwd((p) => ({ ...p, password_confirmation: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancelar</Button>
            <Button onClick={onChangePassword}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
