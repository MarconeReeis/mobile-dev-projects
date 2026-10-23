/** Refeições sugeridas, na ordem do dia. O usuário pode criar outros nomes. */
export const DEFAULT_MEAL_NAMES = [
  "Café da manhã",
  "Lanche da manhã",
  "Almoço",
  "Lanche da tarde",
  "Jantar",
  "Ceia",
] as const;

/** Refeição mais provável para o horário (0–23). */
export function suggestMealName(hour: number): string {
  if (hour < 10) return "Café da manhã";
  if (hour < 12) return "Lanche da manhã";
  if (hour < 15) return "Almoço";
  if (hour < 18) return "Lanche da tarde";
  if (hour < 22) return "Jantar";
  return "Ceia";
}

const rank = (name: string) => {
  const i = (DEFAULT_MEAL_NAMES as readonly string[]).indexOf(name);
  return i < 0 ? Number.POSITIVE_INFINITY : i;
};

/**
 * Posição para inserir uma nova refeição entre as existentes (já ordenadas).
 * Nomes sugeridos entram depois da última refeição que vem antes deles no dia;
 * nomes livres vão para o fim.
 */
export function insertionIndex(existingNames: readonly string[], name: string): number {
  const r = rank(name);
  if (r === Number.POSITIVE_INFINITY) return existingNames.length;
  let position = 0;
  existingNames.forEach((n, i) => {
    if (rank(n) <= r) position = i + 1;
  });
  return position;
}

/** Dados editáveis de uma refeição. */
export type MealFields = { name: string; time?: string; notes?: string };

/** Apara textos, exige nome e transforma opcionais vazios em ausentes. */
export function normalizeMealFields(input: MealFields): MealFields {
  const name = input.name.trim();
  if (!name) throw new Error("O nome da refeição é obrigatório.");
  return {
    name,
    time: input.time?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };
}
