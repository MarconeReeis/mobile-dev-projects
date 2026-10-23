// Datas locais (AAAA-MM-DD), sem conversão para UTC.

import type { ISODate } from "@/domain/nutrition/types";

export function parseISODate(iso: ISODate): Date {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Hoje no fuso informado (padrão: fuso do navegador). */
export function today(timeZone?: string): ISODate {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** DD/MM/AAAA */
export function formatDate(iso: ISODate): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const WEEKDAY_LONG = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
] as const;

export const weekdayShort = (iso: ISODate) => WEEKDAY_SHORT[parseISODate(iso).getDay()]!;
export const weekdayLong = (iso: ISODate) => WEEKDAY_LONG[parseISODate(iso).getDay()]!;
