import { Star, Clock, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  discount?: string;
  isNew?: boolean;
}

export const RestaurantCard = ({
  name,
  cuisine,
  rating,
  deliveryTime,
  deliveryFee,
  image,
  discount,
  isNew
}: RestaurantCardProps) => {
  return (
    <div className="bg-card rounded-xl shadow-card-custom hover:shadow-hover-custom transition-all duration-300 cursor-pointer group overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount && (
          <Badge className="absolute top-2 left-2 bg-delivery-red text-white">
            {discount}
          </Badge>
        )}
        {isNew && (
          <Badge className="absolute top-2 right-2 bg-delivery-green text-white">
            Novo
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 group-hover:text-delivery-red transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{cuisine}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-current text-delivery-yellow" />
            <span className="font-medium">{rating}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{deliveryTime}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>{deliveryFee}</span>
          </div>
        </div>
      </div>
    </div>
  );
};