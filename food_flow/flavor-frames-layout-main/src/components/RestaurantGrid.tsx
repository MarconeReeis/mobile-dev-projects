import { RestaurantCard } from "./RestaurantCard";
import pizzaImage from "@/assets/pizza.jpg";
import sushiImage from "@/assets/sushi.jpg";
import tacosImage from "@/assets/tacos.jpg";

const restaurants = [
  {
    name: "Pizzaria Bella Vista",
    cuisine: "Italiana • Pizza",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: "R$ 3,99",
    image: pizzaImage,
    discount: "30% OFF"
  },
  {
    name: "Sushi Master",
    cuisine: "Japonesa • Sushi",
    rating: 4.9,
    deliveryTime: "30-45 min",
    deliveryFee: "R$ 5,99",
    image: sushiImage,
    isNew: true
  },
  {
    name: "Taco Loco",
    cuisine: "Mexicana • Tacos",
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: "R$ 2,99",
    image: tacosImage,
    discount: "25% OFF"
  },
  {
    name: "Burger Station",
    cuisine: "Americana • Hambúrguer",
    rating: 4.6,
    deliveryTime: "15-25 min",
    deliveryFee: "Grátis",
    image: pizzaImage
  },
  {
    name: "Green Bowl",
    cuisine: "Saudável • Saladas",
    rating: 4.8,
    deliveryTime: "20-30 min",
    deliveryFee: "R$ 4,99",
    image: sushiImage,
    isNew: true
  },
  {
    name: "Café Central",
    cuisine: "Café • Lanches",
    rating: 4.5,
    deliveryTime: "10-20 min",
    deliveryFee: "R$ 2,99",
    image: tacosImage
  }
];

export const RestaurantGrid = () => {
  return (
    <section className="container mx-auto px-4 py-6">
      <h2 className="text-lg font-semibold mb-4">Restaurantes próximos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard key={index} {...restaurant} />
        ))}
      </div>
    </section>
  );
};