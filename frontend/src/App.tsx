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
import EstudioPersonalizado from "@/pages/EstudioPersonalizado";
import Contacto from "@/pages/Contacto";

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
import VendorRequests from "@/pages/admin/VendorRequests";
// PrimeReact y estilos
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import "sweetalert2/dist/sweetalert2.min.css";

//  Carrito
import { CartProvider } from "@/context/CartContext";

const queryClient = new QueryClient();

const routerBasename =
  import.meta.env.VITE_ROUTER_BASENAME && import.meta.env.VITE_ROUTER_BASENAME !== ""
    ? import.meta.env.VITE_ROUTER_BASENAME
    : window.location.hostname.includes('azurewebsites.net')
    ? "/frontend"
    : "/";  

const App = () => (
  <PrimeReactProvider value={{ ripple: true }}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <BrowserRouter basename={routerBasename}>
            <Routes>
              {/* Todo lo de aquí dentro tendrá Navbar (SiteLayout) */}
              <Route element={<SiteLayout />}>
                {/* Públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/estudio-personalizado" element={<EstudioPersonalizado />} />
                <Route path="/contacto" element={<Contacto />} /> 

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
                  path="/vendors/requests"
                  element={
                    <AdminRoute>
                      <VendorRequests />
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

                {/* 404 - Debe ir al final */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </PrimeReactProvider>
);

export default App;
