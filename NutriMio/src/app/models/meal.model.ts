import { MacroNutrients } from './nutrition.model';

export interface Micronutrients {
  fiber: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminB12: number;
}

export const MICRONUTRIENT_FIELDS: {
  key: keyof Micronutrients;
  label: string;
  unit: string;
}[] = [
  { key: 'fiber', label: 'Fibras', unit: 'g' },
  { key: 'sodium', label: 'Sódio', unit: 'mg' },
  { key: 'potassium', label: 'Potássio', unit: 'mg' },
  { key: 'calcium', label: 'Cálcio', unit: 'mg' },
  { key: 'iron', label: 'Ferro', unit: 'mg' },
  { key: 'magnesium', label: 'Magnésio', unit: 'mg' },
  { key: 'zinc', label: 'Zinco', unit: 'mg' },
  { key: 'vitaminA', label: 'Vitamina A', unit: 'µg' },
  { key: 'vitaminC', label: 'Vitamina C', unit: 'mg' },
  { key: 'vitaminD', label: 'Vitamina D', unit: 'µg' },
  { key: 'vitaminE', label: 'Vitamina E', unit: 'mg' },
  { key: 'vitaminB12', label: 'Vitamina B12', unit: 'µg' },
];

export function createEmptyMicronutrients(): Micronutrients {
  return {
    fiber: 0,
    sodium: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    magnesium: 0,
    zinc: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminB12: 0,
  };
}

export interface Food {
  id: string;
  name: string;
  /** Porção de referência no catálogo ou quantidade consumida na refeição. */
  quantity: number;
  unit: string;
  calories: number;
  macros: MacroNutrients;
  micronutrients?: Micronutrients;
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
