import { describe, expect, it } from "vitest";

import {
  dayTotals,
  estimateKcalFromMacros,
  goalsFor,
  portionToAmount,
  progress,
  scaleNutrient,
  sumItems,
} from "./calculations";
import type { GoalVersion, Meal, MealItem, Nutrients } from "./types";

const per100: Nutrients = { kcal: 200, protein: 10, carbs: 20, fat: 8 };

function item(amount: number, nutrients: Nutrients = per100): MealItem {
  return {
    id: crypto.randomUUID(),
    foodId: "f",
    snapshot: { name: "Teste", base: "g", per100: nutrients },
    amount,
  };
}

describe("cálculo proporcional", () => {
  it("150 g de um alimento com 200 kcal/100 g", () => {
    const t = sumItems([item(150)]);
    expect(t.kcal.value).toBe(300);
    expect(t.protein.value).toBe(15);
    expect(t.carbs.value).toBe(30);
    expect(t.fat.value).toBe(12);
  });

  it("não informado retorna null, zero retorna zero", () => {
    expect(scaleNutrient({ fiber: null }, "fiber", 100)).toBeNull();
    expect(scaleNutrient({}, "fiber", 100)).toBeNull();
    expect(scaleNutrient({ fiber: 0 }, "fiber", 100)).toBe(0);
  });
});

describe("porções", () => {
  it("2 fatias de 30 g = 60 g", () => {
    expect(portionToAmount({ amount: 30 }, 2)).toBe(60);
  });
});

describe("totais parciais", () => {
  it("soma os conhecidos e sinaliza parcial", () => {
    const t = sumItems([item(100, { fiber: 5 }), item(100, { fiber: null })]);
    expect(t.fiber).toEqual({ value: 5, partial: true, hasData: true });
  });

  it("sem nenhum dado não é parcial, apenas sem dados", () => {
    const t = sumItems([item(100, {}), item(50, {})]);
    expect(t.iron).toEqual({ value: 0, partial: false, hasData: false });
  });

  it("dia sem refeições não tem dados", () => {
    expect(dayTotals([]).kcal.hasData).toBe(false);
  });

  it("total do dia soma todas as refeições", () => {
    const meal = (items: MealItem[]): Meal => ({ id: "m", date: "2026-10-21", name: "x", order: 0, items });
    expect(dayTotals([meal([item(100)]), meal([item(50)])]).kcal.value).toBe(300);
  });
});

describe("metas por data de vigência", () => {
  const versions: GoalVersion[] = [
    { id: "a", startDate: "2026-08-15", goals: { kcal: { value: 2300, kind: "target" } } },
    { id: "b", startDate: "2026-10-01", goals: { kcal: { value: 2100, kind: "target" } } },
  ];

  it("usa a versão vigente na data", () => {
    expect(goalsFor(versions, "2026-09-30")?.id).toBe("a");
    expect(goalsFor(versions, "2026-10-01")?.id).toBe("b");
    expect(goalsFor(versions, "2026-12-01")?.id).toBe("b");
  });

  it("sem versão vigente retorna undefined", () => {
    expect(goalsFor(versions, "2026-01-01")).toBeUndefined();
  });
});

describe("progresso", () => {
  it("limita o preenchimento a 100% e preserva o percentual real", () => {
    expect(progress(2400, 2000)).toEqual({ pct: 120, fill: 100, over: true, diff: 400 });
  });
});

it("estimativa de kcal pelos macros (4/4/9)", () => {
  expect(estimateKcalFromMacros({ protein: 100, carbs: 200, fat: 50 })).toBe(1650);
});
