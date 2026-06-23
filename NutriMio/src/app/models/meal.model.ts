import { MacroNutrients } from './nutrition.model';

export interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  macros: MacroNutrients;
}

/** @deprecated Use Food */
export type FoodEntry = Food;

export interface MealDraft {
  type: import('./nutrition.model').MealType;
  foodIds: string[];
}

export interface MealSummary {
  calories: number;
  macros: MacroNutrients;
}
