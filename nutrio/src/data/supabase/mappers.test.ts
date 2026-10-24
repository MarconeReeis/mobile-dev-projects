import { describe, expect, it } from "vitest";

import {
  foodFromRow,
  foodToRow,
  goalsToJson,
  goalVersionFromRow,
  mealFromRow,
  type FoodRow,
  type MealItemRow,
  type MealRow,
} from "./mappers";

const nutrientCols = {
  kcal: 253,
  protein: 11.3,
  carbs: 43.7,
  fat: 3.6,
  sat_fat: 0.8,
  trans_fat: 0,
  fiber: 6.9,
  sugar: null,
  added_sugar: null,
  sodium: null,
  calcium: 102,
  iron: 2.4,
  potassium: null,
  vit_c: null,
};

const foodRow: FoodRow = {
  id: "f1",
  user_id: "u1",
  name: "Pão",
  brand: null,
  category: "Padaria",
  base: "g",
  base_amount: 35,
  favorite: true,
  archived: false,
  notes: null,
  created_at: "",
  updated_at: "",
  ...nutrientCols,
};

describe("mapeadores Supabase", () => {
  it("alimento: colunas viram nutrientes, nulo continua não informado, porções ordenadas", () => {
    const food = foodFromRow({
      ...foodRow,
      food_portions: [
        { id: "p2", food_id: "f1", user_id: "u1", name: "2 fatias", amount: 50, position: 1, created_at: "" },
        { id: "p1", food_id: "f1", user_id: "u1", name: "1 fatia", amount: 25, position: 0, created_at: "" },
      ],
    });
    expect(food.per100).toMatchObject({ kcal: 253, satFat: 0.8, transFat: 0, sodium: null, vitC: null });
    expect(food.brand).toBeUndefined();
    expect(food.baseAmount).toBe(35);
    expect(food.portions.map((p) => p.name)).toEqual(["1 fatia", "2 fatias"]);
  });

  it("ida e volta das colunas do alimento", () => {
    const row = foodToRow({ name: "Pão", base: "g", baseAmount: 100, per100: foodFromRow(foodRow).per100, portions: [] });
    expect(row).toMatchObject({ sat_fat: 0.8, trans_fat: 0, vit_c: null, brand: null, base_amount: 100 });
  });

  it("refeição: horário curto, itens ordenados e porção só quando completa", () => {
    const item = (id: string, position: number, portion: boolean): MealItemRow => ({
      id,
      meal_id: "m1",
      user_id: "u1",
      food_id: "f1",
      food_name: "Pão",
      food_brand: null,
      base: "g",
      amount: 50,
      portion_name: portion ? "1 fatia" : null,
      portion_count: portion ? 2 : null,
      portion_amount: portion ? 25 : null,
      position,
      created_at: "",
      updated_at: "",
      ...nutrientCols,
    });
    const row: MealRow = {
      id: "m1",
      user_id: "u1",
      date: "2026-10-22",
      name: "Café da manhã",
      time: "07:30:00",
      notes: null,
      position: 0,
      created_at: "",
      updated_at: "",
    };
    const meal = mealFromRow({ ...row, meal_items: [item("b", 1, false), item("a", 0, true)] });
    expect(meal.time).toBe("07:30");
    expect(meal.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(meal.items[0]!.portion).toEqual({ name: "1 fatia", count: 2, amount: 25 });
    expect(meal.items[1]!.portion).toBeUndefined();
    expect(meal.items[0]!.snapshot.per100.kcal).toBe(253);
  });

  it("metas: enum do banco ↔ chaves do app", () => {
    const v = goalVersionFromRow({
      id: "g1",
      user_id: "u1",
      start_date: "2026-10-01",
      water_ml: 2500,
      created_at: "",
      updated_at: "",
      goal_targets: [{ version_id: "g1", user_id: "u1", nutrient: "sat_fat", value: 20, kind: "limit" }],
    });
    expect(v.goals.satFat).toEqual({ value: 20, kind: "limit" });
    expect(v.waterMl).toBe(2500);
    expect(goalsToJson(v.goals)).toEqual({ sat_fat: { value: 20, kind: "limit" } });
  });
});
