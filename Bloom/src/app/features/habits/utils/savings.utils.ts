import { SAVINGS_COMPARISONS } from '../../../core/constants/savings-comparisons';
import { Habit } from '../../../core/models/habit.model';
import { calcDailySpendRate, calcTotalSavings } from './habit.utils';

const DAYS_PER_MONTH = 30;
const CURIOSITY_COUNT = 3;

export interface FinancialSummary {
  totalSaved: number;
  topIndividualSaved: number;
  monthlyAverage: number;
  hasData: boolean;
}

export function calcMonthlySpendRate(habit: Habit): number | null {
  if (habit.spendAmount == null || habit.spendAmount <= 0 || !habit.spendFrequency) {
    return null;
  }

  return calcDailySpendRate(habit.spendAmount, habit.spendFrequency) * DAYS_PER_MONTH;
}

export function calcFinancialSummary(habits: Habit[], nowMs: number): FinancialSummary {
  let totalSaved = 0;
  let topIndividualSaved = 0;
  let monthlyAverage = 0;
  let hasData = false;

  for (const habit of habits) {
    const elapsedMs = Math.max(0, nowMs - habit.startedAt);
    const saved = calcTotalSavings(habit, elapsedMs);
    const monthlyRate = calcMonthlySpendRate(habit);

    if (saved != null) {
      hasData = true;
      totalSaved += saved;
      topIndividualSaved = Math.max(topIndividualSaved, saved);
    }

    if (monthlyRate != null) {
      hasData = true;
      monthlyAverage += monthlyRate;
    }
  }

  return {
    totalSaved,
    topIndividualSaved,
    monthlyAverage,
    hasData,
  };
}

export function pickCuriosityPhrases(totalSaved: number, count = CURIOSITY_COUNT): string[] {
  if (totalSaved <= 0) {
    return [];
  }

  const eligible = SAVINGS_COMPARISONS.filter((comparison) => {
    return Math.floor(totalSaved / comparison.price) >= 1;
  });

  if (!eligible.length) {
    return [];
  }

  const daySeed = Math.floor(Date.now() / 86_400_000);
  const shuffled = shuffleWithSeed(eligible, daySeed + Math.floor(totalSaved));

  return shuffled.slice(0, Math.min(count, shuffled.length)).map((comparison) => {
    const quantity = Math.floor(totalSaved / comparison.price);
    return comparison.buildPhrase(quantity);
  });
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const next = [...items];
  let state = seed >>> 0;

  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (state * 1_664_525 + 1_013_904_353) >>> 0;
    const swapIndex = state % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
