import { describe, expect, it } from "vitest";

import { foodFormSchema, toFoodInput, toFormValues } from "./food-form-schema";

describe("formulário de alimento", () => {
  it("converte vírgula, mantém vazio como não informado e zero como zero", () => {
    const values = toFormValues();
    values.name = "Iogurte";
    values.nutrients.kcal = "61,5";
    values.nutrients.fiber = "0";
    values.portions = [{ name: "1 pote", amount: "170" }];
    const parsed = foodFormSchema.parse(values);
    const input = toFoodInput(parsed);
    expect(input.per100.kcal).toBe(61.5);
    expect(input.per100.fiber).toBe(0);
    expect(input.per100.sodium).toBeNull();
    expect(input.portions[0]).toMatchObject({ name: "1 pote", amount: 170 });
  });

  it("rejeita nutriente negativo ou inválido e porção sem equivalência", () => {
    const values = toFormValues({ name: "X", base: "g" });
    values.nutrients.protein = "-2";
    values.nutrients.carbs = "abc";
    values.portions = [{ name: "1 colher", amount: "" }];
    const result = foodFormSchema.safeParse(values);
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(
      expect.arrayContaining(["nutrients.protein", "nutrients.carbs", "portions.0.amount"]),
    );
  });

  it("ida e volta a partir de um alimento existente", () => {
    const values = toFormValues({
      name: "Pão",
      base: "g",
      per100: { kcal: 253, potassium: null, sodium: 1200, fat: 3.25 },
      portions: [{ id: "p1", name: "1 fatia", amount: 25 }],
    });
    expect(values.nutrients.kcal).toBe("253");
    expect(values.nutrients.potassium).toBe("");
    expect(values.nutrients.sodium).toBe("1200");
    expect(values.nutrients.fat).toBe("3,25");
    const input = toFoodInput(foodFormSchema.parse(values));
    expect(input.per100).toMatchObject({ kcal: 253, sodium: 1200, fat: 3.25 });
    expect(input.portions[0]).toEqual({ id: "p1", name: "1 fatia", amount: 25 });
  });
});

describe("quantidade de referência no formulário", () => {
  it("digitar valores por 35 g salva por 100 g e lembra a referência", () => {
    const values = toFormValues();
    values.name = "Biscoito integral";
    values.baseAmount = "35";
    values.nutrients.kcal = "140";
    values.nutrients.protein = "3,5";
    values.nutrients.sodium = "";
    const input = toFoodInput(foodFormSchema.parse(values));
    expect(input.baseAmount).toBe(35);
    expect(input.per100.kcal).toBeCloseTo(400);
    expect(input.per100.protein).toBeCloseTo(10);
    expect(input.per100.sodium).toBeNull();
  });

  it("ao editar, os valores voltam na referência informada", () => {
    const values = toFormValues({
      name: "Biscoito",
      base: "g",
      baseAmount: 35,
      per100: { kcal: 400, protein: 10 },
    });
    expect(values.baseAmount).toBe("35");
    expect(values.nutrients.kcal).toBe("140");
    expect(values.nutrients.protein).toBe("3,5");
  });

  it("referência vazia ou zero é inválida", () => {
    const values = toFormValues({ name: "X", base: "g" });
    values.baseAmount = "0";
    expect(foodFormSchema.safeParse(values).success).toBe(false);
  });
});
