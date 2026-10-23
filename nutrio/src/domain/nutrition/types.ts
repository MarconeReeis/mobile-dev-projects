import type { NutrientKey } from "./nutrients";

/** Data local no formato AAAA-MM-DD, sem fuso. */
export type ISODate = string;

/**
 * Valores nutricionais por 100 g ou 100 ml.
 * `null` (ou ausente) = não informado; `0` = informado como zero.
 */
export type Nutrients = Partial<Record<NutrientKey, number | null>>;

export type FoodBase = "g" | "ml";

export type Portion = {
  id: string;
  name: string;
  /** Equivalência em g ou ml, conforme a base do alimento. */
  amount: number;
};

export type Food = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  base: FoodBase;
  per100: Nutrients;
  portions: Portion[];
  favorite: boolean;
  archived: boolean;
  notes?: string;
};

export type MealItem = {
  id: string;
  foodId: string;
  /** Cópia dos dados do alimento no momento do registro. */
  snapshot: { name: string; brand?: string; base: FoodBase; per100: Nutrients };
  /** Quantidade final em g ou ml. */
  amount: number;
  /** Porção usada no registro, com a equivalência vigente naquele momento. */
  portion?: { name: string; count: number; amount: number };
};

export type Meal = {
  id: string;
  date: ISODate;
  name: string;
  /** HH:mm */
  time?: string;
  notes?: string;
  order: number;
  items: MealItem[];
};

export type GoalKind = "target" | "limit";

export type Goal = { value: number; kind: GoalKind };

export type GoalVersion = {
  id: string;
  startDate: ISODate;
  goals: Partial<Record<NutrientKey, Goal>>;
};

export type Total = {
  value: number;
  /** Algum item não informou o nutriente: o valor é a soma apenas dos conhecidos. */
  partial: boolean;
  /** Ao menos um item informou o nutriente. */
  hasData: boolean;
};

export type Totals = Record<NutrientKey, Total>;
