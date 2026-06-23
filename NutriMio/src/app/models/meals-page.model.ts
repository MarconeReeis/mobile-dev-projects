import { MealLogEntry, MealType } from './nutrition.model';

export interface MealCategorySlot {
  type: MealType;
  label: string;
  icon: string;
  meal: MealLogEntry | null;
}
