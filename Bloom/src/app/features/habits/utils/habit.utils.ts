import { DAILY_QUOTES } from '../../../core/constants/habit-presets';
import { Duration, Habit, SpendFrequency } from '../../../core/models/habit.model';

const MS_PER_DAY = 86_400_000;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;

export function calcDuration(fromMs: number, nowMs = Date.now()): Duration {
  const totalMs = Math.max(0, nowMs - fromMs);
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { days, hours, minutes, seconds, totalMs };
}

export function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dailyQuote(): string {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return DAILY_QUOTES[dayIndex % DAILY_QUOTES.length];
}

export function getLongestStreakDays(habit: Habit, currentTotalMs: number): number {
  return Math.floor(Math.max(habit.longestStreakMs, currentTotalMs) / 86400000);
}

export function createHabitId(): string {
  return crypto.randomUUID();
}

export function toLocalDatetimeInput(ms: number): string {
  const date = new Date(ms);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function calcDailySpendRate(amount: number, frequency: SpendFrequency): number {
  switch (frequency) {
    case 'week':
      return amount / DAYS_PER_WEEK;
    case 'month':
      return amount / DAYS_PER_MONTH;
    default:
      return amount;
  }
}

export function calcTotalSavings(habit: Habit, elapsedMs: number): number | null {
  if (habit.spendAmount == null || habit.spendAmount <= 0 || !habit.spendFrequency) {
    return null;
  }

  const dailyRate = calcDailySpendRate(habit.spendAmount, habit.spendFrequency);
  return dailyRate * (Math.max(0, elapsedMs) / MS_PER_DAY);
}

export function startOfLocalDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function startOfLocalMonth(ms: number): number {
  const date = new Date(ms);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function calcSavingsSince(habit: Habit, fromMs: number, nowMs: number): number | null {
  const elapsedMs = Math.max(0, nowMs - Math.max(fromMs, habit.startedAt));
  return calcTotalSavings(habit, elapsedMs);
}

export function calcTodaySavings(habit: Habit, nowMs: number): number | null {
  return calcSavingsSince(habit, startOfLocalDay(nowMs), nowMs);
}

export function calcMonthSavings(habit: Habit, nowMs: number): number | null {
  return calcSavingsSince(habit, startOfLocalMonth(nowMs), nowMs);
}

export function formatSpendBadge(amount: number, frequency: SpendFrequency): string {
  const labels: Record<SpendFrequency, string> = {
    day: 'DIA',
    week: 'SEMANA',
    month: 'MÊS',
  };

  const formatted = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `/ ${labels[frequency]} • ${formatted}`;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSpendRate(amount: number, frequency: SpendFrequency): string {
  const labels: Record<SpendFrequency, string> = {
    day: 'por dia',
    week: 'por semana',
    month: 'por mês',
  };

  return `${formatCurrency(amount)} ${labels[frequency]}`;
}

export function parseSpendAmountInput(raw: string): number | null {
  const normalized = raw.trim().replace(/[^\d,.-]/g, '').replace(',', '.');
  if (!normalized) {
    return null;
  }

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}
