import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import { alertError, alertSuccess } from "@/lib/alerts"; // SweetAlert
import { apiPostJson } from "@/lib/http";

type Rol = "cliente" | "vendedor";

export default function Register() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL as string;

  const [rol, setRol] = useState<Rol>("cliente");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [vendorBrand, setVendorBrand] = useState("");
  const [vendorCompany, setVendorCompany] = useState("");
  const [vendorWebsite, setVendorWebsite] = useState("");
  const [vendorMessage, setVendorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const payload: any = { name, email, password, rol, telefono };

        if (rol === "cliente") {
          payload.telefono = telefono;
          payload.direccion = direccion;
        }

        if (rol === "vendedor") {
          payload.telefono = telefono;
          payload.zona = zona;
          payload.vendor_brand = vendorBrand;
          payload.vendor_company = vendorCompany;
          payload.vendor_website = vendorWebsite;
          payload.vendor_message = vendorMessage;
        }

        // 👇 AQUÍ usamos el helper, que ya monta la URL correcta
        const data = await apiPostJson<any>("/register", payload);

        if (rol === "vendedor") {
          await alertSuccess(
            "Solicitud enviada",
            "Recibirás un correo cuando un administrador autorice tu registro como vendedor."
          );
          navigate("/login");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("auth:changed"));
          await alertSuccess("Registro completado", "¡Bienvenido! Ya puedes comprar.");
          navigate("/");
        }
      } catch (err: any) {
        // Aquí puedes mantener tu lógica de mensaje bonito
        let msg = "No se pudo completar el registro.";

        const status = err?.status;
        const errors = err?.errors || err?.details?.errors;

        if (
          status === 422 &&
          errors?.email &&
          Array.isArray(errors.email)
        ) {
          msg =
            rol === "vendedor"
              ? "Este vendedor ya está registrado en nuestra base de datos. Si crees que es un error, contacta con el administrador."
              : "Este correo ya está registrado en nuestra base de datos. Inicia sesión o usa otro email distinto.";
        } else if (err?.message) {
          msg = err.message;
        }

        await alertError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    return (
      <div className="relative min-h-screen grid place-items-center overflow-hidden bg-gradient-to-br from-background via-background to-background">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>

          <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Crear cuenta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Elige tu rol y completa tus datos
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                {/* Rol */}
                <div className="grid gap-2">
                  <Label>Rol</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={rol === "cliente" ? "default" : "outline"} onClick={() => setRol("cliente")}>Cliente</Button>
                    <Button type="button" variant={rol === "vendedor" ? "default" : "outline"} onClick={() => setRol("vendedor")}>Vendedor</Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {/* <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              </div>

              {rol === "cliente" && (
                <div className="grid gap-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                </div>
              )} */}

                {rol === "vendedor" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zona">Zona</Label>
                      <Input
                        id="zona"
                        value={zona}
                        onChange={(e) => setZona(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="vendor_brand">Marca principal</Label>
                      <Input
                        id="vendor_brand"
                        value={vendorBrand}
                        onChange={(e) => setVendorBrand(e.target.value)}
                        placeholder="Ej. Enerflux"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="vendor_company">Empresa</Label>
                      <Input
                        id="vendor_company"
                        value={vendorCompany}
                        onChange={(e) => setVendorCompany(e.target.value)}
                        placeholder="Ej. Enerflux SL"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="vendor_website">Web (opcional)</Label>
                      <Input
                        id="vendor_website"
                        type="url"
                        value={vendorWebsite}
                        onChange={(e) => setVendorWebsite(e.target.value)}
                        placeholder="https://tusitio.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="vendor_message">
                        Mensaje para el admin (opcional)
                      </Label>
                      <textarea
                        id="vendor_message"
                        className="w-full rounded border bg-background p-2 text-sm"
                        rows={4}
                        value={vendorMessage}
                        onChange={(e) => setVendorMessage(e.target.value)}
                        placeholder="Cuéntanos qué marcas trabajas, zona exacta, experiencia…"
                      />
                    </div>
                  </>

                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow hover:opacity-95"
                >
                  {isLoading ? "Registrando..." : "Crear cuenta"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button type="button" onClick={() => navigate("/login")} className="font-medium text-primary hover:opacity-80">
                  Inicia sesión
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
}
