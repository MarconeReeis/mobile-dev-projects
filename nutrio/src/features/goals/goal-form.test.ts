import { describe, expect, it } from "vitest";

import { fromGoalForm, sameGoals, toGoalForm } from "./goal-form";

describe("editor de metas", () => {
  it("preenche a partir da versão e sugere limite para sódio sem meta", () => {
    const form = toGoalForm({
      kcal: { value: 2100, kind: "target" },
      protein: { value: 130.5, kind: "target" },
    });
    expect(form.kcal).toEqual({ value: "2100", kind: "target" });
    expect(form.protein?.value).toBe("130,5");
    expect(form.sodium).toEqual({ value: "", kind: "limit" });
  });

  it("converte vírgula, ignora vazios e acusa valores inválidos", () => {
    const form = toGoalForm(undefined);
    form.kcal = { value: "2.100", kind: "target" };
    form.fiber = { value: "30,5", kind: "target" };
    const ok = fromGoalForm(form);
    expect(ok).toEqual({
      ok: true,
      goals: { kcal: { value: 2100, kind: "target" }, fiber: { value: 30.5, kind: "target" } },
    });

    form.fat = { value: "0", kind: "limit" };
    form.iron = { value: "abc", kind: "target" };
    const bad = fromGoalForm(form);
    expect(bad.ok).toBe(false);
    expect(!bad.ok && Object.keys(bad.errors).sort()).toEqual(["fat", "iron"]);
  });

  it("editor vazio não pode ser salvo", () => {
    expect(fromGoalForm(toGoalForm(undefined))).toEqual({ ok: false, errors: {}, empty: true });
  });

  it("preserva metas de nutrientes fora do editor", () => {
    const form = toGoalForm(undefined);
    form.kcal = { value: "2000", kind: "target" };
    const result = fromGoalForm(form, { transFat: { value: 2, kind: "limit" } });
    expect(result.ok && result.goals.transFat).toEqual({ value: 2, kind: "limit" });
  });

  it("detecta alterações", () => {
    const base = { kcal: { value: 2000, kind: "target" as const } };
    expect(sameGoals(base, { kcal: { value: 2000, kind: "target" } })).toBe(true);
    expect(sameGoals(base, { kcal: { value: 2000, kind: "limit" } })).toBe(false);
    expect(sameGoals(base, { ...base, fiber: { value: 30, kind: "target" } })).toBe(false);
  });
});
