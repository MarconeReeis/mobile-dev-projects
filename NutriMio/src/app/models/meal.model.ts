import { MacroNutrients } from './nutrition.model';

export interface Food {
  id: string;
  name: string;
  /** Porção de referência no catálogo ou quantidade consumida na refeição. */
  quantity: number;
  unit: string;
  calories: number;
  macros: MacroNutrients;
  /** Porção de referência do cadastro, presente apenas em itens salvos na refeição. */
  referenceQuantity?: number;
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
