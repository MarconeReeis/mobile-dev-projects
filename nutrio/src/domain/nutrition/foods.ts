// Regras do cadastro de alimentos.

import { NUTRIENT_KEYS } from "./nutrients";
import type { Food, FoodBase, Nutrients } from "./types";

/** Dados editáveis de um alimento. Porções sem `id` são novas. */
export type FoodInput = {
  name: string;
  brand?: string;
  category?: string;
  base: FoodBase;
  per100: Nutrients;
  portions: { id?: string; name: string; amount: number }[];
  notes?: string;
};

/** Categorias sugeridas no cadastro; o usuário pode digitar outras. */
export const SUGGESTED_CATEGORIES = [
  "Bebidas",
  "Doces",
  "Frutas",
  "Grãos",
  "Laticínios",
  "Óleos",
  "Padaria",
  "Proteínas",
  "Vegetais",
] as const;

export class FoodValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FoodValidationError";
  }
}

/**
 * Valida e normaliza a entrada: apara textos, remove opcionais vazios e
 * mantém `null` como "não informado" (nunca vira zero).
 */
export function normalizeFoodInput(input: FoodInput): FoodInput {
  const name = input.name.trim();
  if (!name) throw new FoodValidationError("O nome do alimento é obrigatório.");
  if (input.base !== "g" && input.base !== "ml") throw new FoodValidationError("Base inválida.");

  const per100: Nutrients = {};
  for (const key of NUTRIENT_KEYS) {
    const v = input.per100[key];
    if (v === undefined || v === null) {
      per100[key] = null;
      continue;
    }
    if (!Number.isFinite(v) || v < 0) {
      throw new FoodValidationError("Os nutrientes devem ser números maiores ou iguais a zero.");
    }
    per100[key] = v;
  }

  const portions = input.portions.map((p) => {
    const portionName = p.name.trim();
    if (!portionName) throw new FoodValidationError("Toda porção precisa de um nome.");
    if (!(p.amount > 0)) throw new FoodValidationError("A equivalência da porção deve ser maior que zero.");
    return { ...(p.id ? { id: p.id } : {}), name: portionName, amount: p.amount };
  });

  return {
    name,
    brand: input.brand?.trim() || undefined,
    category: input.category?.trim() || undefined,
    base: input.base,
    per100,
    portions,
    notes: input.notes?.trim() || undefined,
  };
}

/** Busca por nome e marca, sem diferenciar maiúsculas nem acentos. */
export function matchesFoodQuery(food: Pick<Food, "name" | "brand">, query: string): boolean {
  const fold = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const q = fold(query.trim());
  return !q || fold(`${food.name} ${food.brand ?? ""}`).includes(q);
}
