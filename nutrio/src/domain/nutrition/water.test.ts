import { describe, expect, it } from "vitest";

import { sortWaterEntries, validateWaterMl, waterTotal } from "./water";

const entry = (id: string, ml: number, time?: string) => ({ id, date: "2026-10-24", ml, time });

describe("água", () => {
  it("soma os registros do dia", () => {
    expect(waterTotal([entry("a", 300), entry("b", 250), entry("c", 500)])).toBe(1050);
    expect(waterTotal([])).toBe(0);
  });

  it("valida a quantidade de um registro", () => {
    expect(validateWaterMl(350)).toBe(350);
    expect(() => validateWaterMl(0)).toThrow();
    expect(() => validateWaterMl(-200)).toThrow();
    expect(() => validateWaterMl(25000)).toThrow(/máximo/);
  });

  it("ordena do mais recente para o mais antigo, sem horário no fim", () => {
    const sorted = sortWaterEntries([entry("a", 1, "07:15"), entry("b", 1), entry("c", 1, "13:20")]);
    expect(sorted.map((e) => e.id)).toEqual(["c", "a", "b"]);
  });
});
