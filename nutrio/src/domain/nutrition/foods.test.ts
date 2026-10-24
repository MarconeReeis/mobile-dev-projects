import { describe, expect, it } from "vitest";

import { fromPer100, matchesFoodQuery, normalizeFoodInput, toPer100, type FoodInput } from "./foods";

const base: FoodInput = {
  name: "  Queijo minas  ",
  brand: " ",
  base: "g",
  baseAmount: 100,
  per100: { kcal: 264, protein: 17.4, fiber: 0 },
  portions: [{ name: " 1 fatia ", amount: 30 }],
};

describe("normalizeFoodInput", () => {
  it("apara textos e remove opcionais vazios", () => {
    const out = normalizeFoodInput(base);
    expect(out.name).toBe("Queijo minas");
    expect(out.brand).toBeUndefined();
    expect(out.portions).toEqual([{ name: "1 fatia", amount: 30 }]);
  });

  it("mantém zero como zero e ausente como não informado", () => {
    const out = normalizeFoodInput(base);
    expect(out.per100.fiber).toBe(0);
    expect(out.per100.sodium).toBeNull();
  });

  it("rejeita nome vazio, nutriente negativo e porção inválida", () => {
    expect(() => normalizeFoodInput({ ...base, name: " " })).toThrow();
    expect(() => normalizeFoodInput({ ...base, per100: { kcal: -1 } })).toThrow();
    expect(() => normalizeFoodInput({ ...base, portions: [{ name: "x", amount: 0 }] })).toThrow();
    expect(() => normalizeFoodInput({ ...base, portions: [{ name: "", amount: 10 }] })).toThrow();
  });

  it("preserva o id de porções existentes", () => {
    const out = normalizeFoodInput({ ...base, portions: [{ id: "p1", name: "1 fatia", amount: 30 }] });
    expect(out.portions[0]?.id).toBe("p1");
  });
});

describe("matchesFoodQuery", () => {
  const food = { name: "Feijão carioca", brand: "Camil" };

  it("ignora acentos e maiúsculas e busca na marca", () => {
    expect(matchesFoodQuery(food, "feijao")).toBe(true);
    expect(matchesFoodQuery(food, "CAMIL")).toBe(true);
    expect(matchesFoodQuery(food, "arroz")).toBe(false);
    expect(matchesFoodQuery(food, "  ")).toBe(true);
  });
});

describe("quantidade de referência livre", () => {
  it("valores por 35 g viram valores por 100 g, e voltam", () => {
    const per35 = { kcal: 140, protein: 7, sodium: null, fiber: 0 };
    const per100 = toPer100(per35, 35);
    expect(per100.kcal).toBeCloseTo(400);
    expect(per100.protein).toBeCloseTo(20);
    expect(per100.sodium).toBeNull();
    expect(per100.fiber).toBe(0);
    const back = fromPer100(per100, 35);
    expect(back.kcal).toBeCloseTo(140, 10);
    expect(back.protein).toBeCloseTo(7, 10);
  });

  it("rejeita quantidade de referência zero ou negativa", () => {
    expect(() => normalizeFoodInput({ ...base, baseAmount: 0 })).toThrow(/referência/);
    expect(() => normalizeFoodInput({ ...base, baseAmount: -35 })).toThrow();
  });
});
