import { MacroGoals } from './nutrition.model';

export type FitnessObjective = 'lose' | 'maintain' | 'gain';

export interface UserWeight {
  current: number;
  initial: number;
  goal: number;
}

export interface UserSettings {
  darkTheme: boolean;
  notifications: boolean;
  metricUnits: boolean;
  waterGoalAuto: boolean;
  hydrationReminderInterval: '1h' | '2h' | 'off';
}

export interface UserProfile {
  id: string;
  name: string;
  fullName: string;
  initials: string;
  email: string;
  isPremium: boolean;
  premiumSince: string;
  fitnessObjective: FitnessObjective;
  age: number;
  weight: UserWeight;
  goals: MacroGoals;
  settings: UserSettings;
}