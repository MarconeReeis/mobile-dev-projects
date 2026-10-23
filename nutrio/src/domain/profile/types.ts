import type { ISODate } from "@/domain/nutrition/types";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";

export type Objective = "maintain" | "lose" | "gain" | "track";

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Sedentário",
  light: "Leve",
  moderate: "Moderado",
  active: "Intenso",
  "very-active": "Muito intenso",
};

export const OBJECTIVE_LABEL: Record<Objective, string> = {
  maintain: "Manter peso",
  lose: "Perder peso",
  gain: "Ganhar peso",
  track: "Apenas acompanhar a alimentação",
};

export type Profile = {
  name: string;
  /** Vem da conta (autenticação); não é editável no perfil. */
  email: string;
  birthDate?: ISODate;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  objective?: Objective;
  /** Fuso IANA, ex.: America/Sao_Paulo. Define o "hoje" do diário. */
  timezone: string;
};

export type ProfileInput = Omit<Profile, "email">;

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileValidationError";
  }
}

/** Faixas aceitas. Servem para pegar erros de digitação, não para julgar valores. */
export const WEIGHT_RANGE = { min: 20, max: 400 } as const;
export const HEIGHT_RANGE = { min: 50, max: 260 } as const;

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Valida e normaliza o perfil. `today` impede data de nascimento no futuro. */
export function normalizeProfile(input: ProfileInput, today: ISODate): ProfileInput {
  const name = input.name.trim();
  if (!name) throw new ProfileValidationError("Informe seu nome.");
  if (input.birthDate !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) || input.birthDate > today) {
      throw new ProfileValidationError("Data de nascimento inválida.");
    }
  }
  const inRange = (v: number | undefined, r: { min: number; max: number }) =>
    v === undefined || (Number.isFinite(v) && v >= r.min && v <= r.max);
  if (!inRange(input.weightKg, WEIGHT_RANGE)) throw new ProfileValidationError("Peso fora da faixa aceita.");
  if (!inRange(input.heightCm, HEIGHT_RANGE))
    throw new ProfileValidationError("Altura fora da faixa aceita.");
  if (!isValidTimeZone(input.timezone)) throw new ProfileValidationError("Fuso horário inválido.");
  return {
    name,
    birthDate: input.birthDate,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    activityLevel: input.activityLevel,
    objective: input.objective,
    timezone: input.timezone,
  };
}

export function firstName(profile: Pick<Profile, "name">): string {
  return profile.name.trim().split(/\s+/)[0] ?? "";
}

export function initials(profile: Pick<Profile, "name">): string {
  const parts = profile.name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
