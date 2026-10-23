// Formatação e parsing no padrão pt-BR.

import { NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export function formatNumber(value: number, maxDigits = 1): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: maxDigits }).format(value);
}

/** Calorias sem casas decimais; demais nutrientes com até uma casa. */
export function formatNutrient(key: NutrientKey, value: number, withUnit = true): string {
  const { unit } = NUTRIENTS[key];
  const n = unit === "kcal" ? integer.format(Math.round(value)) : formatNumber(value, 1);
  return withUnit ? `${n} ${unit}` : n;
}

/**
 * Converte texto digitado pelo usuário ("1,5", "1.234,5", "1.200") em número.
 * Sem vírgula, pontos em grupos de três dígitos são milhar (padrão pt-BR); "2.5" continua 2,5.
 * Campo vazio retorna `null` (não informado), nunca zero.
 */
export function parseDecimal(input: string): number | null {
  const s = input.trim();
  if (s === "") return null;
  const normalized =
    s.includes(",") || /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : Number.NaN;
}
