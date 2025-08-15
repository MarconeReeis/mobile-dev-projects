import { Search, MapPin, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const DeliveryHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DeliveryApp
            </h1>
          </div>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 mb-3">
          <MapPin className="h-5 w-5 text-delivery-red" />
          <div>
            <p className="text-sm font-medium">Entregar em</p>
            <p className="text-sm text-muted-foreground">Rua das Flores, 123 - Centro</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar restaurantes ou pratos..." 
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-delivery-red"
          />
        </div>
      </div>
    </header>
  );
};