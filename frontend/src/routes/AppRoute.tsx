import { Routes, Route, Navigate } from "react-router-dom";

// Páginas públicas
import Home from "@/pages/Index";                 // Hero + Features + ProductShowcase
import ProductDetail from "@/pages/ProductDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// Páginas cliente autenticado
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import MyOrders from "@/pages/MyOrders";
import Profile from "@/pages/Profile";

// Admin
import AdminRoute from "./AdminRoute";
import AdminIndex from "@/pages/admin/Index";
import UsersAdmin from "@/pages/admin/Users";
import VendedoresAdmin from "@/pages/admin/Vendedores";
import ProductosAdmin from "@/pages/admin/Productos";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<Home />} />
      <Route path="/producto/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Cliente autenticado */}
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/cancel" element={<CheckoutCancel />} />
      <Route path="/mis-pedidos" element={<MyOrders />} />
      <Route path="/profile" element={<Profile />} />

      {/* Admin (protegido por AdminRoute) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminIndex />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <AdminRoute>
            <UsersAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/usuarios/:id"
        element={
          <AdminRoute>
            <UsersAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/vendedores"
        element={
          <AdminRoute>
            <VendedoresAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/productos"
        element={
          <AdminRoute>
            <ProductosAdmin />
          </AdminRoute>
        }
      />

      {/* Redirecciones útiles */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
