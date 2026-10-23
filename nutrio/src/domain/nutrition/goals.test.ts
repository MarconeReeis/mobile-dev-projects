import { describe, expect, it } from "vitest";

import { macroEnergyEstimate, normalizeGoals, versionPeriods } from "./goals";
import type { GoalVersion } from "./types";

describe("normalizeGoals", () => {
  it("mantém metas válidas e ignora ausentes", () => {
    expect(normalizeGoals({ kcal: { value: 2000, kind: "target" }, sodium: undefined })).toEqual({
      kcal: { value: 2000, kind: "target" },
    });
  });

  it("rejeita zero, negativo e versão vazia", () => {
    expect(() => normalizeGoals({ kcal: { value: 0, kind: "target" } })).toThrow();
    expect(() => normalizeGoals({ fat: { value: -5, kind: "limit" } })).toThrow();
    expect(() => normalizeGoals({})).toThrow(/ao menos uma/);
  });
});

describe("versionPeriods", () => {
  const v = (id: string, startDate: string): GoalVersion => ({
    id,
    startDate,
    goals: { kcal: { value: 2000, kind: "target" } },
  });
  const versions = [v("a", "2026-08-15"), v("c", "2026-11-01"), v("b", "2026-10-01")];

  it("ordena da mais recente, calcula o fim e o status", () => {
    const periods = versionPeriods(versions, "2026-10-21");
    expect(periods.map((p) => [p.version.id, p.endDate, p.status])).toEqual([
      ["c", undefined, "scheduled"],
      ["b", "2026-10-31", "current"],
      ["a", "2026-09-30", "past"],
    ]);
  });

  it("sem versão iniciada, nenhuma é vigente", () => {
    expect(versionPeriods([v("x", "2027-01-01")], "2026-10-21")[0]!.status).toBe("scheduled");
  });
});

describe("macroEnergyEstimate", () => {
  it("usa 4/4/9 e não depende da meta de calorias", () => {
    expect(
      macroEnergyEstimate({
        kcal: { value: 1500, kind: "target" },
        protein: { value: 130, kind: "target" },
        carbs: { value: 240, kind: "target" },
        fat: { value: 70, kind: "limit" },
      }),
    ).toBe(2110);
  });

  it("sem macros, sem estimativa", () => {
    expect(macroEnergyEstimate({ kcal: { value: 2000, kind: "target" } })).toBeNull();
  });
});
