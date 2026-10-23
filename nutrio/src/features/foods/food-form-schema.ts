// Schema do formulário de alimento: os campos chegam como texto (vírgula decimal)
// e viram um `FoodInput`. Campo vazio = não informado; "0" = zero.

import { z } from "zod";

import type { FoodInput } from "@/domain/nutrition/foods";
import { NUTRIENT_KEYS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { Food } from "@/domain/nutrition/types";
import { parseDecimal } from "@/lib/format";

const optionalNonNegative = z.string().refine((s) => {
  const n = parseDecimal(s);
  return n === null || (Number.isFinite(n) && n >= 0);
}, "Use um número maior ou igual a zero.");

const positive = z.string().refine((s) => {
  const n = parseDecimal(s);
  return n !== null && Number.isFinite(n) && n > 0;
}, "Maior que zero.");

export const foodFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do alimento.").max(80, "Use até 80 caracteres."),
  brand: z.string().max(60, "Use até 60 caracteres."),
  category: z.string().max(40, "Use até 40 caracteres."),
  base: z.enum(["g", "ml"]),
  nutrients: z.object(
    Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, optionalNonNegative])) as Record<
      NutrientKey,
      typeof optionalNonNegative
    >,
  ),
  portions: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().trim().min(1, "Dê um nome à porção."),
      amount: positive,
    }),
  ),
  notes: z.string().max(500, "Use até 500 caracteres."),
});

export type FoodFormValues = z.infer<typeof foodFormSchema>;

// Sem separador de milhar: "1.200" seria lido de volta como 1,2.
const editable = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3, useGrouping: false });
const show = (v: number | null | undefined) => (v === null || v === undefined ? "" : editable.format(v));

/** Valores iniciais do formulário a partir de um alimento (ou vazios). */
export function toFormValues(food?: Partial<Food>): FoodFormValues {
  return {
    name: food?.name ?? "",
    brand: food?.brand ?? "",
    category: food?.category ?? "",
    base: food?.base ?? "g",
    nutrients: Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, show(food?.per100?.[k])])) as Record<
      NutrientKey,
      string
    >,
    portions: (food?.portions ?? []).map((p) => ({ id: p.id, name: p.name, amount: show(p.amount) })),
    notes: food?.notes ?? "",
  };
}

/** Converte os valores validados do formulário na entrada do repositório. */
export function toFoodInput(values: FoodFormValues): FoodInput {
  return {
    name: values.name,
    brand: values.brand,
    category: values.category,
    base: values.base,
    per100: Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, parseDecimal(values.nutrients[k])])),
    portions: values.portions.map((p) => ({ id: p.id, name: p.name, amount: parseDecimal(p.amount)! })),
    notes: values.notes,
  };
}
