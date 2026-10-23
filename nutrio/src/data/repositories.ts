// Contratos de acesso a dados. As telas dependem só destas interfaces;
// a implementação (mock em memória, Supabase, Firebase…) é escolhida em `data/index.ts`.

import type { FoodInput } from "@/domain/nutrition/foods";
import type { MealFields } from "@/domain/nutrition/meals";
import type { Food, GoalVersion, ISODate, Meal } from "@/domain/nutrition/types";
import type { Profile, ProfileInput } from "@/domain/profile/types";

export type AddMealItemInput = {
  date: ISODate;
  /** Adiciona na primeira refeição com este nome na data; cria a refeição se não existir. */
  mealName: string;
  foodId: string;
  /** Quantidade em g ou ml. Com porção, é o total já convertido. */
  amount: number;
  portion?: { name: string; count: number; amount: number };
};

/** Nome, horário (HH:mm) e observações de uma refeição. */
export type MealInput = MealFields;

export type ItemQuantityInput = {
  /** Quantidade final em g ou ml. */
  amount: number;
  /** Porção usada; ausente = quantidade direta em g/ml. */
  portion?: { name: string; count: number; amount: number };
};

/** Destino de um item movido: refeição existente ou nova refeição numa data. */
export type MoveTarget = { mealId: string } | { date: ISODate; mealName: string };

export interface FoodsRepository {
  /** Todos os alimentos, inclusive arquivados, em ordem alfabética. */
  list(): Promise<Food[]>;
  /** Alimentos usados mais recentemente, sem repetição nem arquivados. */
  listRecent(limit: number): Promise<Food[]>;
  /** Ids dos alimentos que aparecem em algum registro (não podem ser excluídos). */
  listUsedIds(): Promise<string[]>;
  create(input: FoodInput): Promise<Food>;
  /** Alterar o cadastro não muda registros antigos: eles guardam uma cópia dos dados. */
  update(foodId: string, input: FoodInput): Promise<Food>;
  duplicate(foodId: string): Promise<Food>;
  setFavorite(foodId: string, favorite: boolean): Promise<Food>;
  setArchived(foodId: string, archived: boolean): Promise<Food>;
  /** Exclui de vez. Falha com `FoodInUseError` se o alimento já foi registrado: arquive-o. */
  remove(foodId: string): Promise<void>;
}

export interface MealsRepository {
  /** Refeições de um intervalo de datas (inclusivo), ordenadas por data e ordem. */
  listRange(start: ISODate, end: ISODate): Promise<Meal[]>;
  createMeal(date: ISODate, input: MealInput): Promise<Meal>;
  updateMeal(mealId: string, input: MealInput): Promise<Meal>;
  /** Troca a refeição de posição com a vizinha no mesmo dia. */
  moveMeal(mealId: string, direction: "up" | "down"): Promise<void>;
  /** Copia a refeição e seus itens (com os mesmos snapshots) para outra data. */
  duplicateMeal(mealId: string, targetDate: ISODate): Promise<Meal>;
  deleteMeal(mealId: string): Promise<void>;

  addItem(input: AddMealItemInput): Promise<Meal>;
  updateItem(mealId: string, itemId: string, input: ItemQuantityInput): Promise<Meal>;
  moveItem(mealId: string, itemId: string, target: MoveTarget): Promise<Meal>;
  removeItem(mealId: string, itemId: string): Promise<void>;
}

export interface GoalsRepository {
  /** Versões de metas, da data de início mais recente para a mais antiga. */
  listVersions(): Promise<GoalVersion[]>;
  /**
   * Salva uma versão a partir da data de início. Se já existir uma versão nessa mesma data,
   * ela é substituída; as demais (e portanto os dias anteriores) não mudam.
   */
  saveVersion(
    startDate: ISODate,
    goals: GoalVersion["goals"],
  ): Promise<{ version: GoalVersion; replaced: boolean }>;
  deleteVersion(versionId: string): Promise<void>;
}

export interface ProfileRepository {
  get(): Promise<Profile>;
  update(input: ProfileInput): Promise<Profile>;
}

/** Cópia completa dos dados do usuário, para portabilidade. */
export type AccountExport = {
  app: "Nutrio";
  formatVersion: 1;
  exportedAt: string;
  profile: Profile;
  foods: Food[];
  meals: Meal[];
  goalVersions: GoalVersion[];
};

export interface AccountRepository {
  exportData(): Promise<AccountExport>;
  /** Remove perfil, alimentos, refeições e metas. Não pode ser desfeito. */
  deleteAccount(): Promise<void>;
}

export type Repositories = {
  foods: FoodsRepository;
  meals: MealsRepository;
  goals: GoalsRepository;
  profile: ProfileRepository;
  account: AccountRepository;
};

export class FoodInUseError extends Error {
  constructor() {
    super("Este alimento já foi registrado em refeições. Arquive-o para preservar o histórico.");
    this.name = "FoodInUseError";
  }
}

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} não encontrado: ${id}`);
    this.name = "NotFoundError";
  }
}
