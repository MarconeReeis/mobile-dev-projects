import { Button } from "@/components/ui/button";
import { Star, Clock } from "lucide-react";
import heroBurger from "@/assets/hero-burger.jpg";

export const FeaturedSection = () => {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-primary h-48 md:h-64">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src={heroBurger} 
          alt="Featured dish"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Promoção Especial!
          </h2>
          <p className="text-sm md:text-base mb-4 opacity-90">
            Hambúrguer Gourmet com 30% de desconto
          </p>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-delivery-yellow" />
              <span className="text-sm">4.8</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">25-35 min</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="self-start">
            Pedir Agora
          </Button>
        </div>
      </div>
    </section>
  );
};