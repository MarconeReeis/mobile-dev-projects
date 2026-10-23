import { beforeEach, describe, expect, it } from "vitest";

import type { Repositories } from "../repositories";
import { createMockRepositories } from "./mock-repositories";
import { createSeed } from "./seed";

const TODAY = "2026-10-21";
let repos: Repositories;

beforeEach(() => {
  repos = createMockRepositories({ latencyMs: 0, seed: createSeed(TODAY) });
});

describe("mock de refeições", () => {
  it("lista o intervalo ordenado e deixa anteontem sem registros", async () => {
    const meals = await repos.meals.listRange("2026-10-15", TODAY);
    expect(meals.length).toBeGreaterThan(0);
    expect(meals.some((m) => m.date === "2026-10-19")).toBe(false);
    expect(meals.map((m) => m.date)).toEqual([...meals.map((m) => m.date)].sort());
  });

  it("adiciona item em refeição existente com snapshot do alimento", async () => {
    const meal = await repos.meals.addItem({
      date: TODAY,
      mealName: "Jantar",
      foodId: "frango",
      amount: 150,
    });
    expect(meal.id).toBe(`${TODAY}-jantar`);
    expect(meal.items.at(-1)?.snapshot.per100.kcal).toBe(159);
  });

  it("cria a refeição quando não existe", async () => {
    const meal = await repos.meals.addItem({ date: TODAY, mealName: "Ceia", foodId: "iogurte", amount: 170 });
    const day = await repos.meals.listRange(TODAY, TODAY);
    expect(day.at(-1)).toMatchObject({ id: meal.id, name: "Ceia" });
  });

  it("rejeita quantidade zero", async () => {
    await expect(
      repos.meals.addItem({ date: TODAY, mealName: "Jantar", foodId: "ovo", amount: 0 }),
    ).rejects.toThrow();
  });

  it("devolve cópias, não referências", async () => {
    const [meal] = await repos.meals.listRange(TODAY, TODAY);
    meal!.items = [];
    const [again] = await repos.meals.listRange(TODAY, TODAY);
    expect(again!.items.length).toBeGreaterThan(0);
  });

  it("remove item e exclui refeição", async () => {
    const [meal] = await repos.meals.listRange(TODAY, TODAY);
    await repos.meals.removeItem(meal!.id, meal!.items[0]!.id);
    expect((await repos.meals.listRange(TODAY, TODAY))[0]!.items.length).toBe(meal!.items.length - 1);
    await repos.meals.deleteMeal(meal!.id);
    expect((await repos.meals.listRange(TODAY, TODAY)).some((m) => m.id === meal!.id)).toBe(false);
  });
});

describe("edição de refeições", () => {
  const day = () => repos.meals.listRange(TODAY, TODAY);

  it("cria refeição na posição do dia e com campos opcionais limpos", async () => {
    const meal = await repos.meals.createMeal(TODAY, { name: "  Lanche da manhã ", time: "", notes: " " });
    expect(meal).toMatchObject({ name: "Lanche da manhã", time: undefined, notes: undefined });
    expect((await day()).map((m) => m.name)).toEqual([
      "Café da manhã",
      "Lanche da manhã",
      "Almoço",
      "Lanche da tarde",
      "Jantar",
    ]);
  });

  it("permite nome repetido e nome livre", async () => {
    await repos.meals.createMeal(TODAY, { name: "Almoço" });
    await repos.meals.createMeal(TODAY, { name: "Pré-treino" });
    const names = (await day()).map((m) => m.name);
    expect(names.filter((n) => n === "Almoço")).toHaveLength(2);
    expect(names.at(-1)).toBe("Pré-treino");
  });

  it("rejeita nome vazio", async () => {
    await expect(repos.meals.createMeal(TODAY, { name: "   " })).rejects.toThrow();
  });

  it("edita nome, horário e observações", async () => {
    const [cafe] = await day();
    const meal = await repos.meals.updateMeal(cafe!.id, {
      name: "Desjejum",
      time: "06:45",
      notes: "Antes do treino",
    });
    expect(meal).toMatchObject({ name: "Desjejum", time: "06:45", notes: "Antes do treino" });
    expect((await repos.meals.updateMeal(cafe!.id, { name: "Desjejum" })).time).toBeUndefined();
  });

  it("reordena com as vizinhas e ignora movimento além da borda", async () => {
    const [cafe] = await day();
    await repos.meals.moveMeal(cafe!.id, "down");
    expect((await day()).map((m) => m.name).slice(0, 2)).toEqual(["Almoço", "Café da manhã"]);
    const [first] = await day();
    await repos.meals.moveMeal(first!.id, "up");
    expect((await day())[0]!.id).toBe(first!.id);
  });

  it("duplica refeição para outra data com novos ids e mesmos snapshots", async () => {
    const [cafe] = await day();
    const copy = await repos.meals.duplicateMeal(cafe!.id, "2026-10-19");
    expect(copy.date).toBe("2026-10-19");
    expect(copy.items).toHaveLength(cafe!.items.length);
    expect(copy.items[0]!.id).not.toBe(cafe!.items[0]!.id);
    expect(copy.items[0]!.snapshot).toEqual(cafe!.items[0]!.snapshot);
  });

  it("edita a quantidade de um item", async () => {
    const [cafe] = await day();
    const item = cafe!.items[0]!;
    const meal = await repos.meals.updateItem(cafe!.id, item.id, { amount: 80 });
    expect(meal.items[0]).toMatchObject({ amount: 80, portion: undefined });
    await expect(repos.meals.updateItem(cafe!.id, item.id, { amount: -1 })).rejects.toThrow();
  });

  it("move item para outra refeição e para nova refeição em outra data", async () => {
    const [cafe, almoco] = await day();
    const item = cafe!.items[0]!;
    await repos.meals.moveItem(cafe!.id, item.id, { mealId: almoco!.id });
    let [c, a] = await day();
    expect(c!.items.some((i) => i.id === item.id)).toBe(false);
    expect(a!.items.at(-1)!.id).toBe(item.id);

    const dest = await repos.meals.moveItem(almoco!.id, item.id, { date: "2026-10-19", mealName: "Ceia" });
    expect(dest).toMatchObject({ date: "2026-10-19", name: "Ceia" });
    [c, a] = await day();
    expect(a!.items.some((i) => i.id === item.id)).toBe(false);
  });
});

describe("mock de alimentos", () => {
  it("recentes vêm do histórico, sem repetição nem arquivados", async () => {
    const recent = await repos.foods.listRecent(5);
    expect(recent).toHaveLength(5);
    expect(new Set(recent.map((f) => f.id)).size).toBe(5);
    expect(recent.every((f) => !f.archived)).toBe(true);
  });
});

describe("cadastro de alimentos", () => {
  const input = {
    name: "Queijo minas frescal",
    category: "Laticínios",
    base: "g" as const,
    per100: { kcal: 264, protein: 17.4, carbs: 3.2, fat: 20.2 },
    portions: [{ name: "1 fatia", amount: 30 }],
  };

  it("cria com porções identificadas e nutrientes vazios como não informados", async () => {
    const food = await repos.foods.create(input);
    expect(food).toMatchObject({ name: "Queijo minas frescal", favorite: false, archived: false });
    expect(food.portions[0]!.id).toBeTruthy();
    expect(food.per100.sodium).toBeNull();
    expect((await repos.foods.list()).some((f) => f.id === food.id)).toBe(true);
  });

  it("editar o alimento não altera registros antigos", async () => {
    const before = (await repos.meals.listRange(TODAY, TODAY))[0]!.items.find((i) => i.foodId === "pao")!;
    await repos.foods.update("pao", { ...input, name: "Pão novo", per100: { kcal: 999 } });
    const after = (await repos.meals.listRange(TODAY, TODAY))[0]!.items.find((i) => i.id === before.id)!;
    expect(after.snapshot).toEqual(before.snapshot);
    expect((await repos.foods.list()).find((f) => f.id === "pao")!.per100.kcal).toBe(999);
  });

  it("editar remove opcionais apagados", async () => {
    const food = await repos.foods.update("pao", { ...input, brand: "" });
    expect(food.brand).toBeUndefined();
  });

  it("duplica com novo id, nome de cópia e sem favorito", async () => {
    const copy = await repos.foods.duplicate("pao");
    expect(copy.id).not.toBe("pao");
    expect(copy.name).toBe("Pão de forma integral (cópia)");
    expect(copy.favorite).toBe(false);
  });

  it("favorita e arquiva", async () => {
    expect((await repos.foods.setFavorite("arroz", true)).favorite).toBe(true);
    expect((await repos.foods.setArchived("arroz", true)).archived).toBe(true);
    expect((await repos.foods.listRecent(20)).some((f) => f.id === "arroz")).toBe(false);
  });

  it("só exclui alimento nunca registrado", async () => {
    expect(await repos.foods.listUsedIds()).toContain("pao");
    await expect(repos.foods.remove("pao")).rejects.toThrow(/Arquive/);
    const food = await repos.foods.create(input);
    await repos.foods.remove(food.id);
    expect((await repos.foods.list()).some((f) => f.id === food.id)).toBe(false);
  });
});

describe("versões de metas", () => {
  const goals = { kcal: { value: 1900, kind: "target" as const } };

  it("lista da mais recente para a mais antiga", async () => {
    const versions = await repos.goals.listVersions();
    expect(versions.map((v) => v.startDate)).toEqual(["2026-10-01", "2026-08-15"]);
  });

  it("nova versão hoje não altera a vigente em dias anteriores", async () => {
    const { replaced } = await repos.goals.saveVersion(TODAY, goals);
    expect(replaced).toBe(false);
    const versions = await repos.goals.listVersions();
    expect(versions).toHaveLength(3);
    expect(versions.find((v) => v.startDate === "2026-10-01")!.goals.kcal!.value).toBe(2100);
  });

  it("mesma data de início substitui a versão", async () => {
    const first = await repos.goals.saveVersion(TODAY, goals);
    const second = await repos.goals.saveVersion(TODAY, { kcal: { value: 1800, kind: "target" } });
    expect(second.replaced).toBe(true);
    expect(second.version.id).toBe(first.version.id);
    expect(await repos.goals.listVersions()).toHaveLength(3);
  });

  it("rejeita metas inválidas e exclui versão", async () => {
    await expect(repos.goals.saveVersion(TODAY, {})).rejects.toThrow();
    await expect(repos.goals.saveVersion("21/10/2026", goals)).rejects.toThrow();
    const [latest] = await repos.goals.listVersions();
    await repos.goals.deleteVersion(latest!.id);
    expect(await repos.goals.listVersions()).toHaveLength(1);
  });
});

describe("perfil e conta", () => {
  it("atualiza o perfil preservando o e-mail da conta", async () => {
    const before = await repos.profile.get();
    const after = await repos.profile.update({
      name: " Marcone ",
      weightKg: 80.2,
      timezone: "America/Manaus",
    });
    expect(after).toMatchObject({
      name: "Marcone",
      weightKg: 80.2,
      timezone: "America/Manaus",
      email: before.email,
    });
    expect(after.heightCm).toBeUndefined();
    await expect(repos.profile.update({ name: "", timezone: "America/Manaus" })).rejects.toThrow();
  });

  it("exporta todos os dados em JSON serializável", async () => {
    const data = await repos.account.exportData();
    expect(data).toMatchObject({ app: "Nutrio", formatVersion: 1 });
    expect(data.foods.length).toBeGreaterThan(0);
    expect(data.meals.length).toBeGreaterThan(0);
    expect(data.goalVersions.length).toBe(2);
    expect(JSON.parse(JSON.stringify(data)).profile.name).toBe(data.profile.name);
  });

  it("exclusão da conta remove todos os dados", async () => {
    await repos.account.deleteAccount();
    const data = await repos.account.exportData();
    expect(data.foods).toEqual([]);
    expect(data.meals).toEqual([]);
    expect(data.goalVersions).toEqual([]);
    expect(data.profile.name).toBe("");
  });
});
