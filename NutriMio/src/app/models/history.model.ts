import { MacroNutrients } from './nutrition.model';

export type DayStatus = 'goal' | 'near' | 'off' | 'none';

export interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: DayStatus;
}

export interface DayHistoryDetail {
  dateKey: string;
  dayNumber: number;
  calories: number;
  calorieGoal: number;
  status: DayStatus;
  macros: MacroNutrients;
}

export interface WeekBar {
  label: string;
  dateKey: string;
  calories: number;
  isSelected: boolean;
}

export interface MonthTrendPoint {
  day: number;
  calories: number;
  x: number;
  y: number;
}
