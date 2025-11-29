import {
  ShoppingBag,
  User,
  ArrowLeft,
  Menu,
  X,
  ShoppingCart,
  Home,
  SunMedium,
  MessageCircle,
  Package,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { confirm, alertSuccess } from "@/lib/alerts";
import { apiPostJson } from "@/lib/http";   

type UserMini = { name?: string; rol?: string };

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authUser, setAuthUser] = useState<UserMini | null>(null);
  const { totalItems } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

    try {
      // usa el helper centralizado, que ya monta la URL y el token
      await apiPostJson("/logout", {});
    } catch {
      // si peta, igualmente limpiamos sesión en el cliente
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:changed"));
    await alertSuccess("Sesión cerrada");
    navigate("/");
    setMobileOpen(false);
  };

  // ... resto del componente igual


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

  const closeMobileAnd = (fn: () => void) => {
    fn();
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        {/* Barra superior */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* IZQUIERDA: logo / back */}
          {isInAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (isAdminRoot ? navigate("/") : navigate("/admin"))}
              className="flex items-center gap-2"
              title={isAdminRoot ? "Volver al inicio" : "Volver al panel"}
            >
              <ArrowLeft className="w-4 h-4" />
              {isAdminRoot ? "Inicio" : "Panel"}
            </Button>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => closeMobileAnd(() => navigate("/"))}
            >
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Enerflux</span>
            </div>
          )}

          {/* CENTRO: menú escritorio */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/?scroll=inicio")}
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </button>

            <button
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              onClick={() => navigate("/?scroll=productos")}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Ver productos</span>
            </button>

            <button
              onClick={() => navigate("/estudio-personalizado")}
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <SunMedium className="h-4 w-4" />
              <span>Estudio personalizado</span>
            </button>

            <button
              onClick={() => navigate("/contacto")}
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contacto</span>
            </button>

            {isLoggedIn && (
              <NavLink
                to="/mis-pedidos"
                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Mis pedidos</span>
              </NavLink>
            )}

            {isAdmin && (
              <>
                <span className="opacity-30">|</span>
                <NavLink
                  to="/admin"
                  className={`inline-flex items-center gap-2 text-sm transition-colors ${active(
                    "/admin"
                  )}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Panel (Admin)</span>
                </NavLink>
              </>
            )}
          </div>

          {/* DERECHA: carrito + auth + hamburguesa */}
          <div className="flex items-center gap-3">
            {/* Carrito */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowCart(true)}
            >
              <i className="pi pi-shopping-cart text-xl text-foreground hover:text-primary transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>

            {/* Auth escritorio */}
            <div className="hidden md:flex items-center gap-2">
              {authUser ? (
                <>
                  <span className="hidden sm:inline text-sm text-muted-foreground">
                    {authUser.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
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

            {/* Botón hamburguesa SOLO mobile */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md border border-border p-1.5"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* MENÚ MOBILE desplegable */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
              <button
                className="inline-flex items-center gap-2 text-left text-foreground hover:text-primary transition-colors"
                onClick={() => closeMobileAnd(() => navigate("/?scroll=inicio"))}
              >
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </button>

              <button
                className="inline-flex items-center gap-2 text-left text-foreground hover:text-primary transition-colors"
                onClick={() => closeMobileAnd(() => navigate("/?scroll=productos"))}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Productos</span>
              </button>

              <button
                className="inline-flex items-center gap-2 text-left text-foreground hover:text-primary transition-colors"
                onClick={() =>
                  closeMobileAnd(() => navigate("/estudio-personalizado"))
                }
              >
                <SunMedium className="h-4 w-4" />
                <span>Estudio personalizado</span>
              </button>

              <button
                className="inline-flex items-center gap-2 text-left text-foreground hover:text-primary transition-colors"
                onClick={() => closeMobileAnd(() => navigate("/contacto"))}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contacto</span>
              </button>

              {isLoggedIn && (
                <button
                  className="inline-flex items-center gap-2 text-left text-foreground hover:text-primary transition-colors"
                  onClick={() => closeMobileAnd(() => navigate("/mis-pedidos"))}
                >
                  <Package className="h-4 w-4" />
                  <span>Mis pedidos</span>
                </button>
              )}

              {isAdmin && (
                <button
                  className={`inline-flex items-center gap-2 text-left transition-colors ${active(
                    "/admin"
                  )}`}
                  onClick={() => closeMobileAnd(() => navigate("/admin"))}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Panel (Admin)</span>
                </button>
              )}

              <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
                {authUser ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Sesión: {authUser.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => closeMobileAnd(() => navigate("/profile"))}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={logout}
                    >
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => closeMobileAnd(() => navigate("/login"))}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Ingresar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="justify-start"
                      onClick={() => closeMobileAnd(() => navigate("/register"))}
                    >
                      Registrarse
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartSidebar visible={showCart} onHide={() => setShowCart(false)} />
    </>
  );
};

export default Navbar;
