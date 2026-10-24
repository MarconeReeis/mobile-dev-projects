// Conversão entre as linhas do banco (snake_case, colunas de nutrientes) e o domínio do app.

import type { FoodInput } from "@/domain/nutrition/foods";
import type { Goals } from "@/domain/nutrition/goals";
import { NUTRIENT_KEYS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { Food, GoalVersion, Meal, MealItem, Nutrients, WaterEntry } from "@/domain/nutrition/types";
import type { Profile, ProfileInput } from "@/domain/profile/types";

import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];
export type FoodRow = Tables["foods"]["Row"];
export type PortionRow = Tables["food_portions"]["Row"];
export type MealRow = Tables["meals"]["Row"];
export type MealItemRow = Tables["meal_items"]["Row"];
export type GoalVersionRow = Tables["goal_versions"]["Row"];
export type GoalTargetRow = Tables["goal_targets"]["Row"];
export type ProfileRow = Tables["profiles"]["Row"];
export type WaterRow = Tables["water_entries"]["Row"];
type DbNutrient = Database["public"]["Enums"]["nutrient_key"];

/** Nome da coluna/enum no banco para cada nutriente do app. */
export const NUTRIENT_COLUMN = {
  kcal: "kcal",
  protein: "protein",
  carbs: "carbs",
  fat: "fat",
  satFat: "sat_fat",
  transFat: "trans_fat",
  fiber: "fiber",
  sugar: "sugar",
  addedSugar: "added_sugar",
  sodium: "sodium",
  calcium: "calcium",
  iron: "iron",
  potassium: "potassium",
  vitC: "vit_c",
} as const satisfies Record<NutrientKey, DbNutrient>;

type NutrientColumns = { [K in (typeof NUTRIENT_COLUMN)[NutrientKey]]: number | null };

const NUTRIENT_FROM_COLUMN = Object.fromEntries(
  Object.entries(NUTRIENT_COLUMN).map(([k, c]) => [c, k]),
) as Record<DbNutrient, NutrientKey>;

export function nutrientsFromRow(row: NutrientColumns): Nutrients {
  const out: Nutrients = {};
  for (const k of NUTRIENT_KEYS) out[k] = row[NUTRIENT_COLUMN[k]];
  return out;
}

export function nutrientsToRow(n: Nutrients): NutrientColumns {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [NUTRIENT_COLUMN[k], n[k] ?? null])) as NutrientColumns;
}

export function foodFromRow(row: FoodRow & { food_portions?: PortionRow[] }): Food {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? undefined,
    category: row.category ?? undefined,
    base: row.base,
    per100: nutrientsFromRow(row),
    baseAmount: row.base_amount,
    portions: [...(row.food_portions ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((p) => ({ id: p.id, name: p.name, amount: p.amount })),
    favorite: row.favorite,
    archived: row.archived,
    notes: row.notes ?? undefined,
  };
}

/** Campos do alimento para insert/update (sem porções, que ficam em outra tabela). */
export function foodToRow(input: FoodInput) {
  return {
    name: input.name,
    brand: input.brand ?? null,
    category: input.category ?? null,
    base: input.base,
    base_amount: input.baseAmount,
    notes: input.notes ?? null,
    ...nutrientsToRow(input.per100),
  };
}

export function itemFromRow(row: MealItemRow): MealItem {
  return {
    id: row.id,
    foodId: row.food_id,
    snapshot: {
      name: row.food_name,
      brand: row.food_brand ?? undefined,
      base: row.base,
      per100: nutrientsFromRow(row),
    },
    amount: row.amount,
    portion:
      row.portion_name !== null && row.portion_count !== null && row.portion_amount !== null
        ? { name: row.portion_name, count: row.portion_count, amount: row.portion_amount }
        : undefined,
  };
}

/** O banco devolve `time` como HH:mm:ss; o app usa HH:mm. */
const shortTime = (t: string | null) => (t ? t.slice(0, 5) : undefined);

export function mealFromRow(row: MealRow & { meal_items?: MealItemRow[] }): Meal {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    time: shortTime(row.time),
    notes: row.notes ?? undefined,
    order: row.position,
    items: [...(row.meal_items ?? [])].sort((a, b) => a.position - b.position).map(itemFromRow),
  };
}

export function goalVersionFromRow(row: GoalVersionRow & { goal_targets?: GoalTargetRow[] }): GoalVersion {
  const goals: Goals = {};
  for (const t of row.goal_targets ?? []) {
    goals[NUTRIENT_FROM_COLUMN[t.nutrient]] = { value: t.value, kind: t.kind };
  }
  return { id: row.id, startDate: row.start_date, goals, waterMl: row.water_ml ?? undefined };
}

export function waterFromRow(row: WaterRow): WaterEntry {
  return { id: row.id, date: row.date, time: shortTime(row.time), ml: row.ml };
}

/** Metas no formato esperado pela função `save_goal_version` ({"sat_fat": {...}}). */
export function goalsToJson(goals: Goals): Record<string, { value: number; kind: string }> {
  const out: Record<string, { value: number; kind: string }> = {};
  for (const k of NUTRIENT_KEYS) {
    const g = goals[k];
    if (g) out[NUTRIENT_COLUMN[k]] = { value: g.value, kind: g.kind };
  }
  return out;
}

export function profileFromRow(row: ProfileRow, email: string): Profile {
  return {
    name: row.name,
    email,
    birthDate: row.birth_date ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    heightCm: row.height_cm ?? undefined,
    activityLevel: row.activity_level ?? undefined,
    objective: row.objective ?? undefined,
    timezone: row.timezone,
  };
}

export function profileToRow(input: ProfileInput) {
  return {
    name: input.name,
    birth_date: input.birthDate ?? null,
    weight_kg: input.weightKg ?? null,
    height_cm: input.heightCm ?? null,
    activity_level: input.activityLevel ?? null,
    objective: input.objective ?? null,
    timezone: input.timezone,
  };
}
