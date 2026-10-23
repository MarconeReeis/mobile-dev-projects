// Implementação dos repositórios sobre o Supabase. A segurança por usuário fica no banco (RLS);
// aqui só traduzimos chamadas e aplicamos as mesmas validações de domínio do mock.

import type { PostgrestError } from "@supabase/supabase-js";

import { normalizeFoodInput } from "@/domain/nutrition/foods";
import { normalizeGoals } from "@/domain/nutrition/goals";
import { normalizeMealFields } from "@/domain/nutrition/meals";
import type { Meal } from "@/domain/nutrition/types";
import { normalizeProfile } from "@/domain/profile/types";
import { today } from "@/lib/dates";

import { FoodInUseError, NotFoundError, type Repositories } from "../repositories";
import type { Supabase } from "./client";
import {
  foodFromRow,
  foodToRow,
  goalsToJson,
  goalVersionFromRow,
  mealFromRow,
  profileFromRow,
  profileToRow,
} from "./mappers";

const FOOD_SELECT = "*, food_portions(*)";
const MEAL_SELECT = "*, meal_items(*)";
const GOAL_SELECT = "*, goal_targets(*)";

/** Erro do banco com o código do Postgres preservado (ex.: 23503 = chave estrangeira). */
export class DatabaseError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
  }
}

function check(error: PostgrestError | null): void {
  if (error) throw new DatabaseError(error.message, error.code);
}

/** Lança o erro do banco, ou um erro se a resposta vier vazia; senão devolve os dados. */
function must<T>({ data, error }: { data: T; error: PostgrestError | null }): NonNullable<T> {
  check(error);
  if (data === null || data === undefined) throw new DatabaseError("Resposta vazia do servidor.");
  return data;
}

export function createSupabaseRepositories(db: Supabase): Repositories {
  async function getFood(foodId: string) {
    const { data, error } = await db.from("foods").select(FOOD_SELECT).eq("id", foodId).maybeSingle();
    check(error);
    if (!data) throw new NotFoundError("Alimento", foodId);
    return foodFromRow(data);
  }

  async function getMeal(mealId: string): Promise<Meal> {
    const { data, error } = await db.from("meals").select(MEAL_SELECT).eq("id", mealId).maybeSingle();
    check(error);
    if (!data) throw new NotFoundError("Refeição", mealId);
    return mealFromRow(data);
  }

  /** Grava as porções do alimento: atualiza as existentes, cria as novas, remove as que saíram. */
  async function syncPortions(foodId: string, portions: { id?: string; name: string; amount: number }[]) {
    const rows = portions.map((p, position) => ({
      id: p.id ?? crypto.randomUUID(),
      food_id: foodId,
      name: p.name,
      amount: p.amount,
      position,
    }));
    if (rows.length > 0) check((await db.from("food_portions").upsert(rows)).error);
    let remove = db.from("food_portions").delete().eq("food_id", foodId);
    if (rows.length > 0) remove = remove.not("id", "in", `(${rows.map((r) => r.id).join(",")})`);
    check((await remove).error);
  }

  async function currentUser() {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) throw new DatabaseError("Sessão expirada. Entre novamente.", "401");
    return data.user;
  }

  const profile: Repositories["profile"] = {
    async get() {
      const user = await currentUser();
      const row = must(await db.from("profiles").select("*").eq("user_id", user.id).maybeSingle());
      return profileFromRow(row, user.email ?? "");
    },

    async update(input) {
      const user = await currentUser();
      const clean = normalizeProfile(input, today(input.timezone));
      check((await db.from("profiles").update(profileToRow(clean)).eq("user_id", user.id)).error);
      return profile.get();
    },
  };

  return {
    foods: {
      async list() {
        const rows = must(await db.from("foods").select(FOOD_SELECT));
        return rows.map(foodFromRow).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      },

      async listRecent(limit) {
        const items = must(
          await db.from("meal_items").select("food_id").order("created_at", { ascending: false }).limit(300),
        );
        const ids = [...new Set(items.map((i) => i.food_id))];
        if (ids.length === 0) return [];
        const rows = must(await db.from("foods").select(FOOD_SELECT).in("id", ids).eq("archived", false));
        const byId = new Map(rows.map((r) => [r.id, foodFromRow(r)]));
        return ids.flatMap((id) => byId.get(id) ?? []).slice(0, limit);
      },

      async listUsedIds() {
        const items = must(await db.from("meal_items").select("food_id"));
        return [...new Set(items.map((i) => i.food_id))];
      },

      async create(input) {
        const clean = normalizeFoodInput(input);
        const row = must(await db.from("foods").insert(foodToRow(clean)).select("id").single());
        await syncPortions(row.id, clean.portions);
        return getFood(row.id);
      },

      async update(foodId, input) {
        const clean = normalizeFoodInput(input);
        check((await db.from("foods").update(foodToRow(clean)).eq("id", foodId)).error);
        await syncPortions(foodId, clean.portions);
        return getFood(foodId);
      },

      async duplicate(foodId) {
        const source = await getFood(foodId);
        const row = must(
          await db
            .from("foods")
            .insert(
              foodToRow({
                ...source,
                name: `${source.name} (cópia)`.slice(0, 80),
                portions: source.portions,
              }),
            )
            .select("id")
            .single(),
        );
        await syncPortions(
          row.id,
          source.portions.map(({ name, amount }) => ({ name, amount })),
        );
        return getFood(row.id);
      },

      async setFavorite(foodId, favorite) {
        check((await db.from("foods").update({ favorite }).eq("id", foodId)).error);
        return getFood(foodId);
      },

      async setArchived(foodId, archived) {
        check((await db.from("foods").update({ archived }).eq("id", foodId)).error);
        return getFood(foodId);
      },

      async remove(foodId) {
        const { error } = await db.from("foods").delete().eq("id", foodId);
        // 23503: o alimento é referenciado por registros (o banco impede a exclusão).
        if (error?.code === "23503") throw new FoodInUseError();
        check(error);
      },
    },

    meals: {
      async listRange(start, end) {
        const rows = must(
          await db
            .from("meals")
            .select(MEAL_SELECT)
            .gte("date", start)
            .lte("date", end)
            .order("date")
            .order("position"),
        );
        return rows.map(mealFromRow);
      },

      async createMeal(date, input) {
        const clean = normalizeMealFields(input);
        const row = must(
          await db.rpc("create_meal", {
            p_date: date,
            p_name: clean.name,
            p_time: clean.time,
            p_notes: clean.notes,
          }),
        );
        return mealFromRow({ ...row, meal_items: [] });
      },

      async updateMeal(mealId, input) {
        const clean = normalizeMealFields(input);
        check(
          (
            await db
              .from("meals")
              .update({ name: clean.name, time: clean.time ?? null, notes: clean.notes ?? null })
              .eq("id", mealId)
          ).error,
        );
        return getMeal(mealId);
      },

      async moveMeal(mealId, direction) {
        check((await db.rpc("move_meal", { p_meal_id: mealId, p_direction: direction })).error);
      },

      async duplicateMeal(mealId, targetDate) {
        const row = must(await db.rpc("duplicate_meal", { p_meal_id: mealId, p_target_date: targetDate }));
        return getMeal(row.id);
      },

      async deleteMeal(mealId) {
        check((await db.from("meals").delete().eq("id", mealId)).error);
      },

      async addItem(input) {
        if (!(input.amount > 0)) throw new Error("A quantidade deve ser maior que zero.");
        const mealId = must(
          await db.rpc("add_meal_item", {
            p_date: input.date,
            p_meal_name: input.mealName,
            p_food_id: input.foodId,
            p_amount: input.amount,
            p_portion_name: input.portion?.name,
            p_portion_count: input.portion?.count,
            p_portion_amount: input.portion?.amount,
          }),
        );
        return getMeal(mealId);
      },

      async updateItem(mealId, itemId, input) {
        if (!(input.amount > 0)) throw new Error("A quantidade deve ser maior que zero.");
        check(
          (
            await db
              .from("meal_items")
              .update({
                amount: input.amount,
                portion_name: input.portion?.name ?? null,
                portion_count: input.portion?.count ?? null,
                portion_amount: input.portion?.amount ?? null,
              })
              .eq("id", itemId)
          ).error,
        );
        return getMeal(mealId);
      },

      async moveItem(_mealId, itemId, target) {
        const targetId = must(
          await db.rpc(
            "move_meal_item",
            "mealId" in target
              ? { p_item_id: itemId, p_target_meal_id: target.mealId }
              : { p_item_id: itemId, p_target_date: target.date, p_target_meal_name: target.mealName },
          ),
        );
        return getMeal(targetId);
      },

      async removeItem(_mealId, itemId) {
        check((await db.from("meal_items").delete().eq("id", itemId)).error);
      },
    },

    goals: {
      async listVersions() {
        const rows = must(
          await db.from("goal_versions").select(GOAL_SELECT).order("start_date", { ascending: false }),
        );
        return rows.map(goalVersionFromRow);
      },

      async saveVersion(startDate, goals) {
        const clean = normalizeGoals(goals);
        const [result] = must(
          await db.rpc("save_goal_version", { p_start_date: startDate, p_goals: goalsToJson(clean) }),
        );
        if (!result) throw new DatabaseError("O servidor não confirmou a versão de metas.");
        const row = must(
          await db.from("goal_versions").select(GOAL_SELECT).eq("id", result.version_id).single(),
        );
        return { version: goalVersionFromRow(row), replaced: result.replaced };
      },

      async deleteVersion(versionId) {
        check((await db.from("goal_versions").delete().eq("id", versionId)).error);
      },
    },

    profile,

    account: {
      async exportData() {
        const [profileData, foods, meals, goalVersions] = await Promise.all([
          profile.get(),
          db.from("foods").select(FOOD_SELECT),
          db.from("meals").select(MEAL_SELECT).order("date").order("position"),
          db.from("goal_versions").select(GOAL_SELECT).order("start_date", { ascending: false }),
        ]);
        return {
          app: "Nutrio" as const,
          formatVersion: 1 as const,
          exportedAt: new Date().toISOString(),
          profile: profileData,
          foods: must(foods).map(foodFromRow),
          meals: must(meals).map(mealFromRow),
          goalVersions: must(goalVersions).map(goalVersionFromRow),
        };
      },

      async deleteAccount() {
        check((await db.rpc("delete_account")).error);
        // A conta já não existe no servidor: basta limpar a sessão local.
        await db.auth.signOut({ scope: "local" });
      },
    },
  };
}
