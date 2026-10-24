// Regras das metas nutricionais (versões com data de início).

import { addDays } from "@/lib/dates";

import { NUTRIENT_KEYS, type NutrientKey } from "./nutrients";
import type { Goal, GoalKind, GoalVersion, ISODate } from "./types";

export type Goals = GoalVersion["goals"];

/** Nutrientes da seção "Principais" da tela de metas. */
export const MAIN_GOAL_KEYS = [
  "kcal",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sodium",
] as const satisfies readonly NutrientKey[];

/** Nutrientes com meta opcional. */
export const OPTIONAL_GOAL_KEYS = [
  "satFat",
  "sugar",
  "calcium",
  "iron",
  "potassium",
  "vitC",
] as const satisfies readonly NutrientKey[];

/** Tipo sugerido ao criar uma meta: o que costuma ser limitado começa como limite. */
export const DEFAULT_GOAL_KIND: Partial<Record<NutrientKey, GoalKind>> = {
  sodium: "limit",
  satFat: "limit",
  sugar: "limit",
  transFat: "limit",
  addedSugar: "limit",
};

export const defaultKind = (key: NutrientKey): GoalKind => DEFAULT_GOAL_KIND[key] ?? "target";

export class GoalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoalValidationError";
  }
}

/** Valida as metas: valores positivos e ao menos uma meta definida. */
export function normalizeGoals(goals: Goals): Goals {
  const out = cleanGoals(goals);
  if (Object.keys(out).length === 0) throw new GoalValidationError("Defina ao menos uma meta.");
  return out;
}

/**
 * Valida uma versão de metas completa: nutrientes e meta de água (ml).
 * Basta uma das duas existir; uma versão só com meta de água é válida.
 */
export function normalizeGoalVersion(goals: Goals, waterMl?: number): { goals: Goals; waterMl?: number } {
  if (waterMl !== undefined && (!Number.isFinite(waterMl) || waterMl <= 0)) {
    throw new GoalValidationError("A meta de água deve ser maior que zero.");
  }
  const clean = cleanGoals(goals);
  if (Object.keys(clean).length === 0 && waterMl === undefined) {
    throw new GoalValidationError("Defina ao menos uma meta.");
  }
  return { goals: clean, waterMl };
}

function cleanGoals(goals: Goals): Goals {
  const out: Goals = {};
  for (const key of NUTRIENT_KEYS) {
    const goal: Goal | undefined = goals[key];
    if (!goal) continue;
    if (!Number.isFinite(goal.value) || goal.value <= 0) {
      throw new GoalValidationError("As metas devem ter valores maiores que zero.");
    }
    if (goal.kind !== "target" && goal.kind !== "limit")
      throw new GoalValidationError("Tipo de meta inválido.");
    out[key] = { value: goal.value, kind: goal.kind };
  }
  return out;
}

export type VersionPeriod = {
  version: GoalVersion;
  /** Último dia em que a versão vale; ausente = vale até hoje e adiante. */
  endDate?: ISODate;
  status: "past" | "current" | "scheduled";
};

/** Períodos de vigência das versões, da mais recente para a mais antiga. */
export function versionPeriods(versions: readonly GoalVersion[], today: ISODate): VersionPeriod[] {
  const sorted = [...versions].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const currentId = sorted.find((v) => v.startDate <= today)?.id;
  return sorted.map((version, i) => {
    const next = sorted[i - 1];
    return {
      version,
      endDate: next ? addDays(next.startDate, -1) : undefined,
      status: version.id === currentId ? "current" : version.startDate > today ? "scheduled" : "past",
    };
  });
}

/** Estimativa de energia das metas de macros (4/4/9). `null` se nenhum macro tiver meta. */
export function macroEnergyEstimate(goals: Goals): number | null {
  const { protein, carbs, fat } = goals;
  if (!protein && !carbs && !fat) return null;
  return (protein?.value ?? 0) * 4 + (carbs?.value ?? 0) * 4 + (fat?.value ?? 0) * 9;
}
