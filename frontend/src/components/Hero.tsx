import { ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnerfluxLogo from "@/components/EnerfluxVideo"; // ya lo tenías así
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="inicio"
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
              🚀 Enerflux
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Tu Marketplace Solar
              <span className="block text-primary">Profesional</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Enerflux te ayuda a encontrar los mejores productos solares de
              proveedores confiables. Simplifica tu instalación solar con
              nuestra ayuda experta y soporte dedicado.
            </p>

           

            <div className="flex items-center gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Productos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">
                  Proveedores
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2K+</div>
                <div className="text-sm text-muted-foreground">Clientes</div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-scale">
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full"></div>

            <EnerfluxLogo
              className="relative rounded-2xl shadow-2xl w-full"
              role="img"
              aria-label="Logo animado de EnerFlux"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
