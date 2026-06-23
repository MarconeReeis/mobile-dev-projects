import { createId } from '../utils/meal.utils';
import { calculateSuggestedGoals } from '../utils/goals-calculator';
import { UserProfile, UserWeight } from '../../models';

const DEFAULT_WEIGHT: UserWeight = {
  current: 80,
  initial: 80,
  goal: 75,
};

export function createDefaultUser(): UserProfile {
  const fitnessObjective = 'lose';
  const goals = calculateSuggestedGoals({
    currentWeight: DEFAULT_WEIGHT.current,
    objective: fitnessObjective,
  });

  return {
    id: createId(),
    name: 'Marcone',
    fullName: 'Marcone Reis',
    initials: 'MR',
    email: '',
    isPremium: false,
    premiumSince: '',
    fitnessObjective,
    weight: DEFAULT_WEIGHT,
    goals,
    settings: {
      darkTheme: false,
      notifications: true,
      metricUnits: true,
    },
  };
}
