import { Pizza, Beef, Fish, Coffee, IceCream, Salad } from "lucide-react";

const categories = [
  { icon: Pizza, name: "Pizza", color: "bg-red-100 text-delivery-red" },
  { icon: Beef, name: "Hambúrguer", color: "bg-orange-100 text-delivery-orange" },
  { icon: Fish, name: "Japonesa", color: "bg-pink-100 text-pink-600" },
  { icon: Coffee, name: "Bebidas", color: "bg-blue-100 text-blue-600" },
  { icon: IceCream, name: "Sobremesas", color: "bg-purple-100 text-purple-600" },
  { icon: Salad, name: "Saudável", color: "bg-green-100 text-delivery-green" },
];

export const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-6">
      <h2 className="text-lg font-semibold mb-4">Categorias</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.name}
              className="flex flex-col items-center p-4 rounded-xl bg-card shadow-card-custom hover:shadow-hover-custom transition-all duration-300 cursor-pointer group"
            >
              <div className={`p-3 rounded-full ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium mt-2 text-center">{category.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};