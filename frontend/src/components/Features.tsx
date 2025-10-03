import { Shield, Zap, Users, BarChart3, Package, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Múltiples Roles",
    description: "Sistema completo para administradores, clientes y proveedores con permisos personalizados.",
  },
  {
    icon: Package,
    title: "Gestión de Inventario",
    description: "Controla tu stock en tiempo real con alertas automáticas y reportes detallados.",
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description: "Integración con múltiples métodos de pago con encriptación de nivel bancario.",
  },
  {
    icon: BarChart3,
    title: "Analytics Avanzado",
    description: "Dashboard con métricas en tiempo real y reportes de ventas personalizables.",
  },
  {
    icon: Zap,
    title: "Rápido y Eficiente",
    description: "Plataforma optimizada para cargas instantáneas y experiencia fluida.",
  },
  {
    icon: Shield,
    title: "Seguridad Total",
    description: "Protección de datos con certificados SSL y cumplimiento de normativas.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que Necesitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Funcionalidades diseñadas para maximizar tu productividad y ventas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
