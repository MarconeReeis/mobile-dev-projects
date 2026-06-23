import { MacroGoals } from '../../models';

export type FitnessObjective = 'lose' | 'maintain' | 'gain';

export interface GoalsCalculationInput {
  currentWeight: number;
  objective: FitnessObjective;
}

export const FITNESS_OBJECTIVE_OPTIONS: FitnessObjective[] = ['lose', 'maintain', 'gain'];

export const FITNESS_OBJECTIVE_LABELS: Record<FitnessObjective, string> = {
  lose: 'Emagrecer',
  maintain: 'Manter',
  gain: 'Ganhar massa',
};

export const FITNESS_OBJECTIVE_SUMMARY: Record<FitnessObjective, string> = {
  lose: 'emagrecer',
  maintain: 'manter o peso',
  gain: 'ganhar massa',
};

const CALORIE_MULTIPLIER: Record<FitnessObjective, number> = {
  lose: 22,
  maintain: 30,
  gain: 32,
};

const PROTEIN_MULTIPLIER: Record<FitnessObjective, number> = {
  lose: 2.0,
  maintain: 1.8,
  gain: 2.2,
};

const FAT_MULTIPLIER = 0.8;
const KCAL_PER_PROTEIN = 4;
const KCAL_PER_CARB = 4;
const KCAL_PER_FAT = 9;
const WATER_ML_PER_KG = 35;

export function calculateSuggestedGoals(input: GoalsCalculationInput): MacroGoals {
  const weight = Math.max(input.currentWeight, 1);
  const calories = Math.round(weight * CALORIE_MULTIPLIER[input.objective]);
  const protein = Math.round(weight * PROTEIN_MULTIPLIER[input.objective]);
  const fat = Math.round(weight * FAT_MULTIPLIER);
  const remainingKcal = Math.max(0, calories - protein * KCAL_PER_PROTEIN - fat * KCAL_PER_FAT);
  const carbs = Math.round(remainingKcal / KCAL_PER_CARB);
  const sugar = Math.round(Math.min(50, Math.max(25, carbs * 0.2)));
  const waterMl = Math.round(weight * WATER_ML_PER_KG);

  return {
    calories,
    protein,
    carbs,
    fat,
    sugar,
    waterMl,
  };
}
