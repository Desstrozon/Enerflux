import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const products = [
  {
    id: 1,
    name: "Producto Premium",
    category: "Electrónica",
    price: "$299.99",
    rating: 4.8,
    image: product1,
  },
  {
    id: 2,
    name: "Gadget Moderno",
    category: "Tecnología",
    price: "$149.99",
    rating: 4.9,
    image: product2,
  },
  {
    id: 3,
    name: "Accesorio Luxury",
    category: "Lifestyle",
    price: "$199.99",
    rating: 4.7,
    image: product3,
  },
];

const ProductShowcase = () => {
  return (
    <section id="productos" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Productos Destacados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra selección curada de productos de alta calidad
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card 
              key={product.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 animate-fade-in-scale"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden aspect-square">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Nuevo
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {product.price}
                  </span>
                  <Button variant="cta" size="sm" className="group">
                    <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 animate-fade-in">
          <Button variant="outline" size="lg">
            Ver Todos los Productos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
