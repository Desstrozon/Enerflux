import { ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type UserMini = { name?: string; rol?: string };

const Navbar = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<UserMini | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    setAuthUser(raw ? JSON.parse(raw) : null);
    // escucha cambios de sesión desde otras pestañas
    const onStorage = () => {
      const r = localStorage.getItem("user");
      setAuthUser(r ? JSON.parse(r) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthUser(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Enerflux</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#inicio" className="text-foreground hover:text-primary transition-colors">Inicio</a>
          <a href="#productos" className="text-foreground hover:text-primary transition-colors">Productos</a>
          <a href="#proveedores" className="text-foreground hover:text-primary transition-colors">Proveedores</a>
          <a href="#contacto" className="text-foreground hover:text-primary transition-colors">Contacto</a>
        </div>

        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {authUser.name} · {authUser.rol}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="hover:bg-secondary">
                <ShoppingBag className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                <User className="h-4 w-4 mr-2" />
                Ingresar
              </Button>
              <Button variant="cta" size="sm" className="hidden sm:inline-flex">
                Registrarse
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
