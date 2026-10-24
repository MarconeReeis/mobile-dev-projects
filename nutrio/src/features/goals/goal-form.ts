// Estado do editor de metas: cada nutriente tem um texto (vírgula decimal) e um tipo.
// Texto vazio = sem meta para o nutriente.

import { defaultKind, MAIN_GOAL_KEYS, OPTIONAL_GOAL_KEYS, type Goals } from "@/domain/nutrition/goals";
import type { NutrientKey } from "@/domain/nutrition/nutrients";
import type { GoalKind } from "@/domain/nutrition/types";
import { parseDecimal } from "@/lib/format";

export const EDITABLE_GOAL_KEYS: NutrientKey[] = [...MAIN_GOAL_KEYS, ...OPTIONAL_GOAL_KEYS];

export type GoalField = { value: string; kind: GoalKind };
export type GoalFormValues = Partial<Record<NutrientKey, GoalField>>;

// Sem separador de milhar: "2.100" é lido como 2100, mas "2100" é inequívoco.
const editable = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2, useGrouping: false });

export function toGoalForm(goals: Goals | undefined): GoalFormValues {
  return Object.fromEntries(
    EDITABLE_GOAL_KEYS.map((k) => {
      const g = goals?.[k];
      return [k, { value: g ? editable.format(g.value) : "", kind: g?.kind ?? defaultKind(k) }];
    }),
  );
}

/** Texto do campo de meta de água (ml) a partir do valor salvo. */
export function toWaterField(waterMl: number | undefined): string {
  return waterMl === undefined ? "" : editable.format(waterMl);
}

export type GoalFormResult =
  | { ok: true; goals: Goals; waterMl?: number }
  | {
      ok: false;
      errors: Partial<Record<NutrientKey, string>>;
      waterError?: string;
      /** Nenhuma meta definida (nem nutrientes, nem água). */
      empty: boolean;
    };

/**
 * Valida o editor. Mantém metas de nutrientes que não aparecem no editor (`keep`).
 * `water` é o texto da meta de água em ml; vazio = sem meta de água.
 * A versão é válida com nutrientes, só com água, ou com os dois.
 */
export function fromGoalForm(values: GoalFormValues, keep: Goals = {}, water = ""): GoalFormResult {
  const goals: Goals = {};
  for (const [k, g] of Object.entries(keep) as [NutrientKey, Goals[NutrientKey]][]) {
    if (g && !EDITABLE_GOAL_KEYS.includes(k)) goals[k] = g;
  }
  const errors: Partial<Record<NutrientKey, string>> = {};
  for (const k of EDITABLE_GOAL_KEYS) {
    const field = values[k];
    if (!field) continue;
    const n = parseDecimal(field.value);
    if (n === null) continue;
    if (!Number.isFinite(n) || n <= 0) errors[k] = "Use um número maior que zero.";
    else goals[k] = { value: n, kind: field.kind };
  }
  const waterParsed = parseDecimal(water);
  const waterInvalid = waterParsed !== null && (!Number.isFinite(waterParsed) || waterParsed <= 0);
  const waterError = waterInvalid ? "Use um número maior que zero." : undefined;
  const waterMl = waterParsed !== null && !waterInvalid ? waterParsed : undefined;

  const empty = Object.keys(goals).length === 0 && waterMl === undefined;
  if (Object.keys(errors).length > 0 || waterError || empty) return { ok: false, errors, waterError, empty };
  return { ok: true, goals, waterMl };
}

/** Compara o editor com uma versão salva (mesmos números e tipos). */
export function sameGoals(a: Goals, b: Goals): boolean {
  return EDITABLE_GOAL_KEYS.every(
    (k) => a[k]?.value === b[k]?.value && (a[k] ? a[k]!.kind === b[k]?.kind : true),
  );
}
