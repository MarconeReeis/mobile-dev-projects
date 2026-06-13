export type SpendFrequency = 'day' | 'week' | 'month';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  startedAt: number;
  createdAt: number;
  relapses: number;
  longestStreakMs: number;
  spendAmount?: number;
  spendFrequency?: SpendFrequency;
}

export interface HabitFormValues {
  name: string;
  emoji: string;
  color: string;
  startedAt: number;
  spendAmount?: number | null;
  spendFrequency?: SpendFrequency | null;
}

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}
