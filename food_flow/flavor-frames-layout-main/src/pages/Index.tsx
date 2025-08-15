import { DeliveryHeader } from "@/components/DeliveryHeader";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedSection } from "@/components/FeaturedSection";
import { RestaurantGrid } from "@/components/RestaurantGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DeliveryHeader />
      <main>
        <FeaturedSection />
        <CategoryGrid />
        <RestaurantGrid />
      </main>
    </div>
  );
};

export default Index;
