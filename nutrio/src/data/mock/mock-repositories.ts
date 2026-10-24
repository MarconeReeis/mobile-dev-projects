// Implementação em memória dos repositórios. Os dados somem ao recarregar a página.

import { normalizeFoodInput, type FoodInput } from "@/domain/nutrition/foods";
import { GoalValidationError, normalizeGoalVersion } from "@/domain/nutrition/goals";
import { insertionIndex, normalizeMealFields } from "@/domain/nutrition/meals";
import type { Food, ISODate, Meal, MealItem, WaterEntry } from "@/domain/nutrition/types";
import { validateWaterMl } from "@/domain/nutrition/water";
import { normalizeProfile } from "@/domain/profile/types";
import { today as getToday } from "@/lib/dates";

import { FoodInUseError, NotFoundError, type MealInput, type Repositories } from "../repositories";
import { createSeed, type Seed } from "./seed";

type Options = {
  /** Atraso artificial para exercitar estados de carregamento. */
  latencyMs?: number;
  seed?: Seed;
};

export function createMockRepositories({ latencyMs = 150, seed }: Options = {}): Repositories {
  const db = seed ?? createSeed(getToday());

  // Sempre devolve cópias: quem chama não pode alterar o "banco" por referência.
  async function respond<T>(value: T): Promise<T> {
    if (latencyMs > 0) await new Promise((r) => setTimeout(r, latencyMs));
    return structuredClone(value);
  }

  function findMeal(id: string): Meal {
    const meal = db.meals.find((m) => m.id === id);
    if (!meal) throw new NotFoundError("Refeição", id);
    return meal;
  }

  function findItem(meal: Meal, itemId: string): MealItem {
    const item = meal.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundError("Item", itemId);
    return item;
  }

  function findFood(id: string): Food {
    const food = db.foods.find((f) => f.id === id);
    if (!food) throw new NotFoundError("Alimento", id);
    return food;
  }

  const usedFoodIds = () => new Set(db.meals.flatMap((m) => m.items.map((i) => i.foodId)));

  /** Valida a entrada e completa ids de porções novas. */
  function toFood(input: FoodInput): Omit<Food, "id" | "favorite" | "archived"> {
    const clean = normalizeFoodInput(input);
    return { ...clean, portions: clean.portions.map((p) => ({ ...p, id: p.id ?? crypto.randomUUID() })) };
  }

  const byDateAndOrder = (a: Meal, b: Meal) => a.date.localeCompare(b.date) || a.order - b.order;

  /** Refeições do dia, ordenadas (referências do "banco"). */
  const mealsOn = (date: ISODate) => db.meals.filter((m) => m.date === date).sort(byDateAndOrder);

  /** Cria a refeição na posição sugerida pelo nome e renumera a ordem do dia. */
  function insertMeal(date: ISODate, input: MealInput): Meal {
    const day = mealsOn(date);
    const meal: Meal = { id: crypto.randomUUID(), date, order: 0, items: [], ...input };
    day.splice(
      insertionIndex(
        day.map((m) => m.name),
        meal.name,
      ),
      0,
      meal,
    );
    day.forEach((m, order) => (m.order = order));
    db.meals.push(meal);
    return meal;
  }

  /** Primeira refeição com o nome na data; cria se não existir. */
  function findOrCreateMeal(date: ISODate, name: string): Meal {
    return db.meals.find((m) => m.date === date && m.name === name) ?? insertMeal(date, { name });
  }

  function assertAmount(amount: number) {
    if (!(amount > 0)) throw new Error("A quantidade deve ser maior que zero.");
  }

  return {
    foods: {
      list: () => respond([...db.foods].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))),

      listUsedIds: () => respond([...usedFoodIds()]),

      async create(input) {
        const food: Food = { id: crypto.randomUUID(), favorite: false, archived: false, ...toFood(input) };
        db.foods.push(food);
        return respond(food);
      },

      async update(foodId, input) {
        const food = findFood(foodId);
        Object.assign(food, { brand: undefined, category: undefined, notes: undefined }, toFood(input));
        return respond(food);
      },

      async duplicate(foodId) {
        const source = findFood(foodId);
        const copy: Food = {
          ...structuredClone(source),
          id: crypto.randomUUID(),
          name: `${source.name} (cópia)`,
          favorite: false,
          archived: false,
          portions: source.portions.map((p) => ({ ...p, id: crypto.randomUUID() })),
        };
        db.foods.push(copy);
        return respond(copy);
      },

      async setFavorite(foodId, favorite) {
        const food = findFood(foodId);
        food.favorite = favorite;
        return respond(food);
      },

      async setArchived(foodId, archived) {
        const food = findFood(foodId);
        food.archived = archived;
        return respond(food);
      },

      async remove(foodId) {
        findFood(foodId);
        if (usedFoodIds().has(foodId)) throw new FoodInUseError();
        db.foods = db.foods.filter((f) => f.id !== foodId);
        await respond(undefined);
      },

      listRecent(limit) {
        const ids: string[] = [];
        const meals = [...db.meals].sort(byDateAndOrder).reverse();
        for (const item of meals.flatMap((m) => [...m.items].reverse())) {
          if (!ids.includes(item.foodId)) ids.push(item.foodId);
          if (ids.length >= limit) break;
        }
        const foods = ids.map((id) => db.foods.find((f) => f.id === id && !f.archived)).filter((f) => !!f);
        return respond(foods);
      },
    },

    meals: {
      listRange: (start: ISODate, end: ISODate) =>
        respond(db.meals.filter((m) => m.date >= start && m.date <= end).sort(byDateAndOrder)),

      async createMeal(date, input) {
        const meal = insertMeal(date, normalizeMealFields(input));
        return respond(meal);
      },

      async updateMeal(mealId, input) {
        const meal = findMeal(mealId);
        Object.assign(meal, { time: undefined, notes: undefined }, normalizeMealFields(input));
        return respond(meal);
      },

      async moveMeal(mealId, direction) {
        const meal = findMeal(mealId);
        const day = mealsOn(meal.date);
        const i = day.indexOf(meal);
        const j = direction === "up" ? i - 1 : i + 1;
        if (j >= 0 && j < day.length) {
          [day[i], day[j]] = [day[j]!, day[i]!];
          day.forEach((m, order) => (m.order = order));
        }
        await respond(undefined);
      },

      async duplicateMeal(mealId, targetDate) {
        const source = findMeal(mealId);
        const copy = insertMeal(targetDate, { name: source.name, time: source.time, notes: source.notes });
        copy.items = source.items.map((item) => ({ ...structuredClone(item), id: crypto.randomUUID() }));
        return respond(copy);
      },

      async deleteMeal(mealId) {
        findMeal(mealId);
        db.meals = db.meals.filter((m) => m.id !== mealId);
        await respond(undefined);
      },

      async addItem(input) {
        assertAmount(input.amount);
        const food = db.foods.find((f) => f.id === input.foodId);
        if (!food) throw new NotFoundError("Alimento", input.foodId);

        const meal = findOrCreateMeal(input.date, input.mealName);
        meal.items.push({
          id: crypto.randomUUID(),
          foodId: food.id,
          snapshot: { name: food.name, brand: food.brand, base: food.base, per100: { ...food.per100 } },
          amount: input.amount,
          portion: input.portion,
        });
        return respond(meal);
      },

      async updateItem(mealId, itemId, input) {
        assertAmount(input.amount);
        const meal = findMeal(mealId);
        const item = findItem(meal, itemId);
        item.amount = input.amount;
        item.portion = input.portion;
        return respond(meal);
      },

      async moveItem(mealId, itemId, target) {
        const source = findMeal(mealId);
        const item = findItem(source, itemId);
        const dest =
          "mealId" in target ? findMeal(target.mealId) : findOrCreateMeal(target.date, target.mealName);
        if (dest !== source) {
          source.items = source.items.filter((i) => i !== item);
          dest.items.push(item);
        }
        return respond(dest);
      },

      async removeItem(mealId, itemId) {
        const meal = findMeal(mealId);
        meal.items = meal.items.filter((i) => i.id !== itemId);
        await respond(undefined);
      },
    },

    goals: {
      listVersions: () =>
        respond([...db.goalVersions].sort((a, b) => b.startDate.localeCompare(a.startDate))),

      async saveVersion(startDate, goals, waterMl) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new GoalValidationError("Data de início inválida.");
        const clean = normalizeGoalVersion(goals, waterMl);
        const existing = db.goalVersions.find((v) => v.startDate === startDate);
        if (existing) {
          existing.goals = clean.goals;
          existing.waterMl = clean.waterMl;
          return respond({ version: existing, replaced: true });
        }
        const version = { id: crypto.randomUUID(), startDate, ...clean };
        db.goalVersions.push(version);
        return respond({ version, replaced: false });
      },

      async deleteVersion(versionId) {
        if (!db.goalVersions.some((v) => v.id === versionId))
          throw new NotFoundError("Versão de metas", versionId);
        db.goalVersions = db.goalVersions.filter((v) => v.id !== versionId);
        await respond(undefined);
      },
    },

    water: {
      listRange: (start, end) => respond(db.waterEntries.filter((e) => e.date >= start && e.date <= end)),

      async add(date, ml, time) {
        const entry: WaterEntry = { id: crypto.randomUUID(), date, time, ml: validateWaterMl(ml) };
        db.waterEntries.push(entry);
        return respond(entry);
      },

      async remove(entryId) {
        db.waterEntries = db.waterEntries.filter((e) => e.id !== entryId);
        await respond(undefined);
      },
    },

    profile: {
      get: () => respond(db.profile),

      async update(input) {
        const clean = normalizeProfile(input, getToday(input.timezone));
        db.profile = { email: db.profile.email, ...clean };
        return respond(db.profile);
      },
    },

    account: {
      exportData: () =>
        respond({
          app: "Nutrio" as const,
          formatVersion: 1 as const,
          exportedAt: new Date().toISOString(),
          profile: db.profile,
          foods: db.foods,
          meals: [...db.meals].sort(byDateAndOrder),
          goalVersions: db.goalVersions,
          waterEntries: db.waterEntries,
        }),

      async deleteAccount() {
        db.foods = [];
        db.meals = [];
        db.goalVersions = [];
        db.waterEntries = [];
        db.profile = { name: "", email: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
        await respond(undefined);
      },
    },
  };
}
