// src/layouts/SiteLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar"; // ajusta la ruta si tu Navbar está en otro sitio
// import Footer from "@/components/Footer"; // opcional si tienes footer

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      {/* <Footer /> */}
    </div>
  );
}
