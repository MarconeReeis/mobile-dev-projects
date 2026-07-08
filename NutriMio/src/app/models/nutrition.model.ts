import { Food } from './meal.model';

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface MacroGoals extends MacroNutrients {
  calories: number;
  waterMl: number;
}

export interface MealLogEntry {  id: string;
  type: MealType;
  name: string;
  time: string;
  foodCount: number;
  calories: number;
  foodTags: string[];
  foods: Food[];
}

export interface WaterEntry {
  id: string;
  amountMl: number;
  time: string;
}

export interface DailyLog {
  date: string;
  calories: number;
  macros: MacroNutrients;
  meals: MealLogEntry[];
  waterMl: number;
  waterEntries: WaterEntry[];
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  supper: 'Ceia',
};

export const MEAL_TYPE_OPTIONS: MealType[] = [
  'breakfast',
  'lunch',
  'snack',
  'dinner',
  'supper',
];

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: 'cafe-outline',
  lunch: 'sunny-outline',
  snack: 'nutrition-outline',
  dinner: 'moon-outline',
  supper: 'bed-outline',
};

export interface MacroSummary {
  key: keyof MacroNutrients;
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  progress: number;
}

export interface WaterSummary {
  current: number;
  goal: number;
  remaining: number;
  progress: number;
  entries: WaterEntry[];
}

export const WATER_QUICK_ADD_OPTIONS: number[] = [150, 200, 250, 300, 500];

export interface DailySummary {
  calories: number;
  calorieGoal: number;
  caloriesRemaining: number;
  calorieProgress: number;
  macros: MacroSummary[];
  meals: MealLogEntry[];
  water: WaterSummary;
}
