import React, { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

// Si usas Sonner para toasts:
let notifyError = (msg: string) => {};
try {
  // evita crash si aún no está instalado/importado
  const { toast } = require("sonner");
  notifyError = (msg: string) => toast.error(msg);
} catch {}

function getAuth() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    null;

  let user: any = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  return { token, user };
}

function getUserRole(user: any): string {
  if (!user) return "";
  // Tu backend usa 'rol' (admin | administrador | vendedor | cliente)
  const raw = user?.rol ?? user?.role?.name ?? user?.role ?? "";
  return String(raw).trim().toLowerCase();
}

type AdminRouteProps = {
  children: ReactNode;
  redirectTo?: string; // dónde mandar si no hay sesión
  fallbackWhenNotAdmin?: string; // dónde mandar si no es admin
};

const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  redirectTo = "/login",
  fallbackWhenNotAdmin = "/",
}) => {
  const location = useLocation();
  const { token, user } = getAuth();
  const role = getUserRole(user);

  const isLoggedIn = Boolean(token);
  const isAdmin = role === "admin" || role === "administrador";

  useEffect(() => {
    if (!isLoggedIn) notifyError("Debes iniciar sesión para entrar aquí.");
    else if (!isAdmin) notifyError("Acceso restringido: solo administradores.");
  }, [isLoggedIn, isAdmin]);

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to={fallbackWhenNotAdmin} replace />;
  }
  return <>{children}</>;
};

export default AdminRoute;
