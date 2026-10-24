// Regras do registro de água.

import type { WaterEntry } from "./types";

/** Cada "copo" do indicador do resumo representa esta quantidade. */
export const WATER_CUP_ML = 250;

/** Atalhos de registro rápido. */
export const WATER_QUICK_ML = [200, 500] as const;

/** Sugestões de meta diária na tela de metas. */
export const WATER_GOAL_PRESETS_ML = [2000, 2500, 3000] as const;

/** Teto por registro: só para pegar erros de digitação (ex.: 25000 em vez de 250). */
export const WATER_MAX_ENTRY_ML = 5000;

export class WaterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WaterValidationError";
  }
}

export function validateWaterMl(ml: number): number {
  if (!Number.isFinite(ml) || ml <= 0) throw new WaterValidationError("Informe uma quantidade maior que zero.");
  if (ml > WATER_MAX_ENTRY_ML) {
    throw new WaterValidationError(`Use no máximo ${WATER_MAX_ENTRY_ML} ml por registro.`);
  }
  return ml;
}

export function waterTotal(entries: readonly WaterEntry[]): number {
  return entries.reduce((sum, e) => sum + e.ml, 0);
}

/** Registros mais recentes primeiro (os sem horário, lançados depois, vão para o fim). */
export function sortWaterEntries(entries: readonly WaterEntry[]): WaterEntry[] {
  return [...entries].sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""));
}
