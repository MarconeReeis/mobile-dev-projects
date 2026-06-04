export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  startedAt: number;
  createdAt: number;
  relapses: number;
  longestStreakMs: number;
}

export interface HabitFormValues {
  name: string;
  emoji: string;
  color: string;
  startedAt: number;
}

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}
