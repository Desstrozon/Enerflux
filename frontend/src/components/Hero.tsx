import { ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-marketplace.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
              🚀 Plataforma Nueva
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Tu Marketplace
              <span className="block text-primary">Profesional</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Conectamos clientes, proveedores y administradores en una plataforma 
              moderna y eficiente. Gestiona tu negocio desde un solo lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="lg" className="group">
                Empezar Ahora
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ver Productos
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Productos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Proveedores</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2K+</div>
                <div className="text-sm text-muted-foreground">Clientes</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in-scale">
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full"></div>
            <img 
              src={heroImage} 
              alt="MarketHub Platform" 
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
