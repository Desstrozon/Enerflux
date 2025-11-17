import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";

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
  const [msg, setMsg] = useState<{type:"ok"|"err"; text:string}|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      const payload: any = { name, email, password, rol, telefono };
      if (rol === "vendedor") payload.zona = zona;
      if (rol === "cliente")  payload.direccion = direccion;

      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 
        Accept: "application/json",   // 👈 Añadir esto
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(()=> "");
        setMsg({ type:"err", text: text || "No se pudo registrar" });
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMsg({ type:"ok", text:"Registro completado" });
      navigate("/");
    } catch {
      setMsg({ type:"err", text:"Error de conexión con el servidor" });
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
            {msg && (
              <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                msg.type === "ok"
                  ? "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-rose-300/60 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
              }`}>{msg.text}</div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Rol */}
              <div className="grid gap-2">
                <Label>Rol</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={rol==="cliente"?"default":"outline"} onClick={()=>setRol("cliente")}>Cliente</Button>
                  <Button type="button" variant={rol==="vendedor"?"default":"outline"} onClick={()=>setRol("vendedor")}>Vendedor</Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={telefono} onChange={(e)=>setTelefono(e.target.value)} required />
              </div>

              {rol === "cliente" && (
                <div className="grid gap-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" value={direccion} onChange={(e)=>setDireccion(e.target.value)} required />
                </div>
              )}

              {rol === "vendedor" && (
                <div className="grid gap-2">
                  <Label htmlFor="zona">Zona</Label>
                  <Input id="zona" value={zona} onChange={(e)=>setZona(e.target.value)} required />
                </div>
              )}

              <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow hover:opacity-95">
                {isLoading ? "Registrando..." : "Crear cuenta"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button type="button" onClick={()=>navigate("/login")} className="font-medium text-primary hover:opacity-80">
                Inicia sesión
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
