import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import MyOrders from "@/pages/MyOrders";
// sweetAlert2 
import 'sweetalert2/dist/sweetalert2.min.css';


import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";

// Proveedor PrimeReact (para ripple y asegurar estilos “styled”)
import { PrimeReactProvider } from "primereact/api";

// Páginas públicas
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Rutas protegidas
import AdminRoute from "@/routes/AdminRoute";

// Páginas del administrador
import AdminIndex from "@/pages/admin/Index";
import UsersAdmin from "@/pages/admin/Users";
import VendedoresAdmin from "@/pages/admin/Vendedores";
import ProductosAdmin from "@/pages/admin/Productos";

// 🛒 Contexto del carrito
import { CartProvider } from "@/context/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <PrimeReactProvider value={{ ripple: true  }}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* Carrito disponible en toda la app */}
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
              
              {/* Panel administrador */}
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
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/mis-pedidos" element={<MyOrders />} />

            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </PrimeReactProvider>
);

export default App;
