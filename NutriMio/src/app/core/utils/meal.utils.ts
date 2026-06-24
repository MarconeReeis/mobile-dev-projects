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

export function getReferenceQuantity(food: FoodEntry): number {
  return food.referenceQuantity ?? food.quantity;
}

function roundNutrition(value: number): number {
  return Math.round(value * 10) / 10;
}

export function scaleFoodToQuantity(
  catalogFood: FoodEntry,
  consumedQuantity: number,
): FoodEntry {
  const referenceQuantity = getReferenceQuantity(catalogFood);

  if (referenceQuantity <= 0 || consumedQuantity <= 0) {
    return { ...catalogFood, quantity: consumedQuantity };
  }

  const ratio = consumedQuantity / referenceQuantity;

  return {
    id: catalogFood.id,
    name: catalogFood.name,
    quantity: consumedQuantity,
    unit: catalogFood.unit,
    referenceQuantity,
    calories: roundNutrition(catalogFood.calories * ratio),
    macros: {
      protein: roundNutrition(catalogFood.macros.protein * ratio),
      carbs: roundNutrition(catalogFood.macros.carbs * ratio),
      fat: roundNutrition(catalogFood.macros.fat * ratio),
      sugar: roundNutrition(catalogFood.macros.sugar * ratio),
    },
  };
}

export function consumedQuantityFromPortions(
  catalogFood: FoodEntry,
  portionCount: number,
): number {
  return portionCount * getReferenceQuantity(catalogFood);
}

export function adjustConsumedByPortions(
  catalogFood: FoodEntry,
  currentConsumed: number,
  deltaPortions: number,
): number {
  const step = getReferenceQuantity(catalogFood);
  return roundNutrition(Math.max(step, currentConsumed + deltaPortions * step));
}

export function getPortionCountFromConsumed(
  catalogFood: FoodEntry,
  consumedQuantity: number,
): number {
  const referenceQuantity = getReferenceQuantity(catalogFood);

  if (referenceQuantity <= 0) {
    return 1;
  }

  return consumedQuantity / referenceQuantity;
}

export function formatPortionCount(value: number): string {
  return Number.isInteger(value) ? String(value) : String(roundNutrition(value));
}

export function portionCountFromConsumed(
  catalogFood: FoodEntry,
  consumedQuantity: number,
): number {
  return Math.max(1, Math.round(getPortionCountFromConsumed(catalogFood, consumedQuantity)));
}

export function getPortionStepLabel(unit: string, count: number): string {
  const labels: Record<string, [string, string]> = {
    un: ['unidade', 'unidades'],
    fatias: ['fatia', 'fatias'],
    colher: ['colher', 'colheres'],
    porção: ['porção', 'porções'],
    g: ['porção', 'porções'],
    ml: ['porção', 'porções'],
  };

  const [singular, plural] = labels[unit] ?? ['porção', 'porções'];
  return count === 1 ? singular : plural;
}

export function formatPortionEquivalent(
  food: FoodEntry,
  portionCount: number,
): string | null {
  const total = consumedQuantityFromPortions(food, portionCount);
  const referenceQuantity = getReferenceQuantity(food);

  if (food.unit === 'g' || food.unit === 'ml') {
    return `${formatQuantity(total)} ${food.unit}`;
  }

  if (food.unit === 'un' && referenceQuantity === 1) {
    return null;
  }

  return `${formatQuantity(total)} ${food.unit}`;
}

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : String(roundNutrition(value));
}

export function createId(): string {
  return crypto.randomUUID();
}

export function toFoodTag(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? name;
  return firstWord.length > 14 ? `${firstWord.slice(0, 14)}…` : firstWord;
}
