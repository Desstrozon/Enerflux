import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  to: string;              // ruta destino (ej: "/admin" o "/")
  label?: string;          // texto del botón
  className?: string;      // estilos extra opcionales
};

export default function BackButton({ to, label = "Volver", className }: Props) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 ${className ?? ""}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
