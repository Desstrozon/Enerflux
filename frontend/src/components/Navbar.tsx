import { ShoppingBag, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { confirm, alertSuccess } from "@/lib/alerts";

type UserMini = { name?: string; rol?: string };

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authUser, setAuthUser] = useState<UserMini | null>(null);
  const { totalItems } = useCart();
  const itemCount = totalItems;

  const [showCart, setShowCart] = useState(false);

  const refreshAuth = () => {
    const raw = localStorage.getItem("user");
    setAuthUser(raw ? JSON.parse(raw) : null);
  };

  useEffect(() => {
    refreshAuth();
    const onStorage = () => refreshAuth();
    const onAuthChanged = () => refreshAuth();
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", onAuthChanged as EventListener);
    };
  }, []);

  const isAdmin = useMemo(() => {
    const r = String(authUser?.rol ?? "").toLowerCase();
    return r === "admin" || r === "administrador";
  }, [authUser]);

  const isLoggedIn = !!authUser;

  const logout = async () => {
    const ok = await confirm("Cerrar sesión", "¿Seguro que quieres salir?", "Sí, salir");
    if (!ok) return;

    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
      });
    } catch {
      // silencioso
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:changed"));

    await alertSuccess("Sesión cerrada");
    navigate("/");
  };

  const active = (path: string) =>
    location.pathname === path ||
    (path === "/admin" && location.pathname.startsWith("/admin"))
      ? "text-primary font-medium"
      : "text-foreground";

  const isAdminRoot = location.pathname === "/admin";
  const isAdminSub =
    location.pathname.startsWith("/admin/usuarios") ||
    location.pathname.startsWith("/admin/vendedores");
  const isInAdmin = isAdminRoot || isAdminSub;

  return (
    <>
      {/* 🧭 NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Izquierda */}
          {isInAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(isAdminRoot ? "/" : "/admin")}
              className="flex items-center gap-2"
              title={isAdminRoot ? "Volver al inicio" : "Volver al panel"}
            >
              <ArrowLeft className="w-4 h-4" />
              {isAdminRoot ? "Inicio" : "Panel"}
            </Button>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Enerflux</span>
            </div>
          )}

          {/* Centro */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-foreground hover:text-primary transition-colors">
              Inicio
            </a>
            <a href="#productos" className="text-foreground hover:text-primary transition-colors">
              Productos
            </a>
            <a href="#proveedores" className="text-foreground hover:text-primary transition-colors">
              Proveedores
            </a>
            <a href="#contacto" className="text-foreground hover:text-primary transition-colors">
              Contacto
            </a>

            {isLoggedIn && (
              <>
                <NavLink to="/mis-pedidos" className="text-foreground hover:text-primary transition-colors">
                  Mis pedidos
                </NavLink>               
              </>
            )}

            {isAdmin && (
              <>
                <span className="opacity-30">|</span>
                <NavLink to="/admin" className={`transition-colors ${active("/admin")}`}>
                  Panel (Admin)
                </NavLink>
              </>
            )}
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-4">
            {/* 🛒 Carrito */}
            <div className="relative cursor-pointer" onClick={() => setShowCart(true)}>
              <i className="pi pi-shopping-cart text-xl text-foreground hover:text-primary transition"></i>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>

            {/* 👤 Sesión */}
            {authUser ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {authUser.name} · {authUser.rol}
                </span>

                {/* 👤 Nuevo botón Perfil a la derecha */}
                <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>

                <Button variant="outline" size="sm" onClick={logout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                  <User className="h-4 w-4 mr-2" />
                  Ingresar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate("/register")}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 🧺 Sidebar del carrito */}
      <CartSidebar visible={showCart} onHide={() => setShowCart(false)} />
    </>
  );
};

export default Navbar;
