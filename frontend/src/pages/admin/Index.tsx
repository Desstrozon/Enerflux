import { Link } from "react-router-dom";
import { Users, BadgePercent, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

export default function AdminIndex() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel de Administración</h1>
        <BackButton to="/" label="Volver al inicio" />
      </header>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {/* Tarjeta Usuarios */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium">Usuarios</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona cuentas y roles del sistema.
            </p>
          </div>
          <Link to="/admin/usuarios" className="mt-4">
            <Button className="w-full">
              <Users className="mr-2 h-4 w-4" /> Ver usuarios
            </Button>
          </Link>
        </Card>

        {/* Tarjeta Vendedores */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium">Vendedores</h2>
            <p className="text-sm text-muted-foreground">
              Consulta y administra vendedores registrados.
            </p>
          </div>
          <Link to="/admin/vendedores" className="mt-4">
            <Button className="w-full">
              <BadgePercent className="mr-2 h-4 w-4" /> Ver vendedores
            </Button>
          </Link>
        </Card>

        {/* 🆕 Tarjeta Productos */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium">Productos</h2>
            <p className="text-sm text-muted-foreground">
              Añade, edita o elimina productos del catálogo.
            </p>
          </div>
          <Link to="/admin/productos" className="mt-4">
            <Button className="w-full">
              <Package className="mr-2 h-4 w-4" /> Ver productos
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
