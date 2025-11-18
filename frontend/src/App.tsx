// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SiteLayout from "@/layouts/SiteLayout";

// Páginas públicas
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProductDetail from "@/pages/ProductDetail";

// Páginas auth del cliente
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import MyOrders from "@/pages/MyOrders";
import Profile from "@/pages/Profile";

// Admin
import AdminRoute from "@/routes/AdminRoute";
import AdminIndex from "@/pages/admin/Index";
import UsersAdmin from "@/pages/admin/Users";
import VendedoresAdmin from "@/pages/admin/Vendedores";
import ProductosAdmin from "@/pages/admin/Productos";

// PrimeReact y estilos
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import "sweetalert2/dist/sweetalert2.min.css";

// 🛒 Carrito
import { CartProvider } from "@/context/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <PrimeReactProvider value={{ ripple: true }}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Todo lo de aquí dentro tendrá Navbar (SiteLayout) */}
              <Route element={<SiteLayout />}>
                {/* Públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />

                {/* Cliente autenticado */}
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                <Route path="/mis-pedidos" element={<MyOrders />} />
                <Route path="/profile" element={<Profile />} />

                {/* Panel administrador (con el mismo layout/ Navbar) */}
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
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </PrimeReactProvider>
);

export default App;
