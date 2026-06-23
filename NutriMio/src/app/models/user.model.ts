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
  weight: UserWeight;
  goals: MacroGoals;
  settings: UserSettings;
}