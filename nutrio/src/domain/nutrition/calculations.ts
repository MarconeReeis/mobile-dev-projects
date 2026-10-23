// Regras de cálculo. Funções puras: sem arredondamento (só na exibição).

import { KCAL_PER_GRAM, NUTRIENT_KEYS, type NutrientKey } from "./nutrients";
import type { GoalVersion, ISODate, Meal, MealItem, Nutrients, Portion, Totals } from "./types";

/** Nutriente proporcional à quantidade: valor por 100 × quantidade / 100. */
export function scaleNutrient(per100: Nutrients, key: NutrientKey, amount: number): number | null {
  const value = per100[key];
  if (value === null || value === undefined) return null;
  return (value * amount) / 100;
}

/** Converte um número de porções na quantidade em g/ml. */
export function portionToAmount(portion: Pick<Portion, "amount">, count: number): number {
  return portion.amount * count;
}

export function itemNutrient(item: MealItem, key: NutrientKey): number | null {
  return scaleNutrient(item.snapshot.per100, key, item.amount);
}

export function sumItems(items: readonly MealItem[]): Totals {
  const totals = {} as Totals;
  for (const key of NUTRIENT_KEYS) {
    let value = 0;
    let missing = 0;
    for (const item of items) {
      const n = itemNutrient(item, key);
      if (n === null) missing++;
      else value += n;
    }
    const hasData = missing < items.length;
    totals[key] = { value, hasData, partial: hasData && missing > 0 };
  }
  return totals;
}

export function mealTotals(meal: Meal): Totals {
  return sumItems(meal.items);
}

export function dayTotals(meals: readonly Meal[]): Totals {
  return sumItems(meals.flatMap((m) => m.items));
}

/** Versão de metas vigente na data: a de início mais recente que não seja posterior a ela. */
export function goalsFor(versions: readonly GoalVersion[], date: ISODate): GoalVersion | undefined {
  let current: GoalVersion | undefined;
  for (const v of versions) {
    if (v.startDate <= date && (!current || v.startDate > current.startDate)) current = v;
  }
  return current;
}

export type Progress = {
  /** Percentual real, pode passar de 100. */
  pct: number;
  /** Percentual para preenchimento visual, limitado a 100. */
  fill: number;
  over: boolean;
  /** Distância absoluta até a meta (restante ou excedente). */
  diff: number;
};

export function progress(consumed: number, goal: number): Progress {
  const pct = goal > 0 ? (consumed / goal) * 100 : 0;
  return { pct, fill: Math.min(pct, 100), over: consumed > goal, diff: Math.abs(goal - consumed) };
}

/** Estimativa de kcal a partir dos macros. Informativa: nunca substitui a meta calórica. */
export function estimateKcalFromMacros(macros: { protein?: number; carbs?: number; fat?: number }): number {
  return (
    (macros.protein ?? 0) * KCAL_PER_GRAM.protein +
    (macros.carbs ?? 0) * KCAL_PER_GRAM.carbs +
    (macros.fat ?? 0) * KCAL_PER_GRAM.fat
  );
}
