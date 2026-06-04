import { DAILY_QUOTES } from '../../../core/constants/habit-presets';
import { Duration, Habit } from '../../../core/models/habit.model';

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
