import { describe, expect, it } from "vitest";

import { addDays, formatDate } from "./dates";
import { formatNutrient, parseDecimal } from "./format";

describe("parseDecimal", () => {
  it("aceita vírgula e ponto de milhar", () => {
    expect(parseDecimal("1,5")).toBe(1.5);
    expect(parseDecimal("1.234,5")).toBe(1234.5);
    expect(parseDecimal("2.5")).toBe(2.5);
    expect(parseDecimal("1.200")).toBe(1200);
    expect(parseDecimal("12.345.678")).toBe(12345678);
  });

  it("vazio é não informado, não zero", () => {
    expect(parseDecimal("  ")).toBeNull();
    expect(parseDecimal("0")).toBe(0);
  });

  it("texto inválido retorna NaN", () => {
    expect(parseDecimal("abc")).toBeNaN();
  });
});

describe("formatNutrient", () => {
  it("kcal sem decimais, demais com uma casa", () => {
    expect(formatNutrient("kcal", 1234.6)).toBe("1.235 kcal");
    expect(formatNutrient("protein", 12.34)).toBe("12,3 g");
  });
});

describe("datas", () => {
  it("formata DD/MM/AAAA e soma dias atravessando o mês", () => {
    expect(formatDate("2026-10-21")).toBe("21/10/2026");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
});
