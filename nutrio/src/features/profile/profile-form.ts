// Formulário do perfil: campos como texto (vírgula decimal) → ProfileInput.

import { z } from "zod";

import {
  ACTIVITY_LABEL,
  HEIGHT_RANGE,
  isValidTimeZone,
  OBJECTIVE_LABEL,
  WEIGHT_RANGE,
  type ActivityLevel,
  type Objective,
  type Profile,
  type ProfileInput,
} from "@/domain/profile/types";
import { parseDecimal } from "@/lib/format";

/** Valor dos selects quando o usuário prefere não informar. */
export const UNSET = "unset";

const optionalInRange = (range: { min: number; max: number }, unit: string) =>
  z.string().refine((s) => {
    const n = parseDecimal(s);
    return n === null || (Number.isFinite(n) && n >= range.min && n <= range.max);
  }, `Use um valor entre ${range.min} e ${range.max} ${unit}.`);

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(80, "Use até 80 caracteres."),
  birthDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")]),
  weightKg: optionalInRange(WEIGHT_RANGE, "kg"),
  heightCm: optionalInRange(HEIGHT_RANGE, "cm"),
  activityLevel: z.enum([UNSET, ...(Object.keys(ACTIVITY_LABEL) as ActivityLevel[])]),
  objective: z.enum([UNSET, ...(Object.keys(OBJECTIVE_LABEL) as Objective[])]),
  timezone: z.string().refine(isValidTimeZone, "Escolha um fuso horário válido."),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const editable = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, useGrouping: false });

export function toProfileForm(profile: Profile): ProfileFormValues {
  return {
    name: profile.name,
    birthDate: profile.birthDate ?? "",
    weightKg: profile.weightKg === undefined ? "" : editable.format(profile.weightKg),
    heightCm: profile.heightCm === undefined ? "" : editable.format(profile.heightCm),
    activityLevel: profile.activityLevel ?? UNSET,
    objective: profile.objective ?? UNSET,
    timezone: profile.timezone,
  };
}

export function toProfileInput(values: ProfileFormValues): ProfileInput {
  return {
    name: values.name,
    birthDate: values.birthDate || undefined,
    weightKg: parseDecimal(values.weightKg) ?? undefined,
    heightCm: parseDecimal(values.heightCm) ?? undefined,
    activityLevel: values.activityLevel === UNSET ? undefined : values.activityLevel,
    objective: values.objective === UNSET ? undefined : values.objective,
    timezone: values.timezone,
  };
}

/** Fusos brasileiros, com nomes reconhecíveis, mostrados primeiro. */
export const BRAZIL_TIME_ZONES: { zone: string; label: string }[] = [
  { zone: "America/Sao_Paulo", label: "Brasília (SP, RJ, MG, Sul, GO, DF…)" },
  { zone: "America/Bahia", label: "Bahia" },
  { zone: "America/Fortaleza", label: "Fortaleza (CE, MA, PI, RN, PB)" },
  { zone: "America/Recife", label: "Recife (PE)" },
  { zone: "America/Maceio", label: "Maceió (AL, SE)" },
  { zone: "America/Belem", label: "Belém (PA, AP)" },
  { zone: "America/Araguaina", label: "Araguaína (TO)" },
  { zone: "America/Cuiaba", label: "Cuiabá (MT)" },
  { zone: "America/Campo_Grande", label: "Campo Grande (MS)" },
  { zone: "America/Manaus", label: "Manaus (AM)" },
  { zone: "America/Porto_Velho", label: "Porto Velho (RO)" },
  { zone: "America/Boa_Vista", label: "Boa Vista (RR)" },
  { zone: "America/Rio_Branco", label: "Rio Branco (AC)" },
  { zone: "America/Noronha", label: "Fernando de Noronha" },
];

/** Demais fusos do navegador, com o atual garantido na lista. */
export function otherTimeZones(current: string): string[] {
  const brazil = new Set(BRAZIL_TIME_ZONES.map((z) => z.zone));
  const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  const others = all.filter((z) => !brazil.has(z));
  return brazil.has(current) || others.includes(current) ? others : [current, ...others];
}
