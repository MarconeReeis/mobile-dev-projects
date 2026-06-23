import { FoodEntry, MealSummary, MacroNutrients } from '../../models';

const EMPTY_MACROS: MacroNutrients = {
  protein: 0,
  carbs: 0,
  fat: 0,
  sugar: 0,
};

export function sumMacros(foods: FoodEntry[]): MacroNutrients {
  return foods.reduce(
    (total, food) => ({
      protein: total.protein + food.macros.protein,
      carbs: total.carbs + food.macros.carbs,
      fat: total.fat + food.macros.fat,
      sugar: total.sugar + food.macros.sugar,
    }),
    { ...EMPTY_MACROS },
  );
}

export function sumCalories(foods: FoodEntry[]): number {
  return foods.reduce((total, food) => total + food.calories, 0);
}

export function buildMealSummary(foods: FoodEntry[]): MealSummary {
  return {
    calories: sumCalories(foods),
    macros: sumMacros(foods),
  };
}

export function createId(): string {
  return crypto.randomUUID();
}

export function toFoodTag(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? name;
  return firstWord.length > 14 ? `${firstWord.slice(0, 14)}…` : firstWord;
}
