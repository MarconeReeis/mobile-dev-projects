import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_KEYS } from '../core/constants/storage-keys';
import { toDateKey } from '../core/utils/date.utils';
import { addDays, getWeekStart, parseDateKey, toDateKeyFromParts } from '../core/utils/calendar.utils';
import { createId, toFoodTag } from '../core/utils/meal.utils';
import {
  DailyLog,
  DailySummary,
  DayHistoryDetail,
  DayStatus,
  Food,
  MacroGoals,
  MacroNutrients,
  MacroSummary,
  MonthTrendPoint,
  MEAL_TYPE_ICONS,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_OPTIONS,
  MealCategorySlot,
  MealLogEntry,
  MealType,
  WeekBar,
} from '../models';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

const MACRO_CONFIG: Array<{
  key: keyof MacroNutrients;
  label: string;
  unit: string;
  color: string;
}> = [
  { key: 'protein', label: 'Proteínas', unit: 'g', color: 'var(--nutrimio-macro-protein)' },
  { key: 'carbs', label: 'Carboidratos', unit: 'g', color: 'var(--nutrimio-macro-carbs)' },
  { key: 'fat', label: 'Gorduras', unit: 'g', color: 'var(--nutrimio-macro-fat)' },
  { key: 'sugar', label: 'Açúcares', unit: 'g', color: 'var(--nutrimio-macro-sugar)' },
];

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private readonly summarySubject = new BehaviorSubject<DailySummary | null>(null);
  private readonly mealSlotsSubject = new BehaviorSubject<MealCategorySlot[]>([]);

  readonly dailySummary$: Observable<DailySummary | null> = this.summarySubject.asObservable();
  readonly todayMealSlots$: Observable<MealCategorySlot[]> = this.mealSlotsSubject.asObservable();

  private logs = new Map<string, DailyLog>();

  constructor(
    private readonly storage: StorageService,
    private readonly userService: UserService,
  ) {}

  async load(): Promise<void> {
    const stored = await this.storage.get<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS);
    this.logs = new Map(Object.entries(stored ?? {}));
    this.refreshToday();
  }

  hasAnyLogs(): boolean {
    return this.logs.size > 0;
  }

  hasMealsToday(): boolean {
    const log = this.logs.get(toDateKey());
    return (log?.meals.length ?? 0) > 0;
  }

  getLogForDate(dateKey: string): DailyLog | undefined {
    return this.logs.get(dateKey);
  }

  getTodaySummary(): DailySummary | null {
    return this.summarySubject.value;
  }

  getTodayMealSlots(): MealCategorySlot[] {
    return this.mealSlotsSubject.value;
  }

  async refreshToday(): Promise<void> {
    const dateKey = toDateKey();
    this.summarySubject.next(this.buildSummary(dateKey));
    this.mealSlotsSubject.next(this.buildMealSlots(dateKey));
  }

  getDayStatus(calories: number, goal?: number): DayStatus {
    const calorieGoal = goal ?? this.userService.getUser().goals.calories;

    if (calories <= 0) {
      return 'none';
    }

    const ratio = calories / calorieGoal;

    if (ratio >= 0.85 && ratio <= 1.05) {
      return 'goal';
    }

    if ((ratio >= 0.7 && ratio < 0.85) || (ratio > 1.05 && ratio <= 1.2)) {
      return 'near';
    }

    return 'off';
  }

  getStatusMapForMonth(year: number, month: number): Map<string, DayStatus> {
    const map = new Map<string, DayStatus>();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const goal = this.userService.getUser().goals.calories;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKeyFromParts(year, month, day);
      const log = this.logs.get(dateKey);
      map.set(dateKey, this.getDayStatus(log?.calories ?? 0, goal));
    }

    return map;
  }

  getDayDetail(dateKey: string): DayHistoryDetail {
    const log = this.logs.get(dateKey);
    const goal = this.userService.getUser().goals.calories;
    const calories = log?.calories ?? 0;
    const [, , day] = dateKey.split('-').map(Number);

    return {
      dateKey,
      dayNumber: day,
      calories,
      calorieGoal: goal,
      status: this.getDayStatus(calories, goal),
      macros: log?.macros ?? { protein: 0, carbs: 0, fat: 0, sugar: 0 },
    };
  }

  getWeekBars(selectedDateKey: string): WeekBar[] {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weekStart = getWeekStart(parseDateKey(selectedDateKey));
    const bars: WeekBar[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = toDateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
      const log = this.logs.get(dateKey);

      bars.push({
        label: labels[i],
        dateKey,
        calories: log?.calories ?? 0,
        isSelected: dateKey === selectedDateKey,
      });
    }

    return bars;
  }

  getMonthTrend(year: number, month: number): MonthTrendPoint[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const goal = this.userService.getUser().goals.calories;
    const points: Array<{ day: number; calories: number }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKeyFromParts(year, month, day);
      const calories = this.logs.get(dateKey)?.calories ?? 0;
      if (calories > 0) {
        points.push({ day, calories });
      }
    }

    if (!points.length) {
      return [];
    }

    const maxCalories = Math.max(goal, ...points.map((point) => point.calories));
    const chartHeight = 80;
    const chartWidth = 280;

    return points.map((point, index) => ({
      day: point.day,
      calories: point.calories,
      x: points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth,
      y: chartHeight - (point.calories / maxCalories) * chartHeight,
    }));
  }

  getCalorieGoal(): number {
    return this.userService.getUser().goals.calories;
  }

  getTotalMealsLogged(): number {
    let total = 0;
    this.logs.forEach((log) => {
      total += log.meals.length;
    });
    return total;
  }

  getCurrentStreak(): number {
    let streak = 0;
    const date = new Date();

    while (streak < 365) {
      const dateKey = toDateKey(date);
      const log = this.logs.get(dateKey);

      if (!log || log.calories <= 0) {
        break;
      }

      streak += 1;
      date.setDate(date.getDate() - 1);
    }

    return streak;
  }

  async saveMealForToday(type: MealType, foods: Food[]): Promise<void> {
    if (!foods.length) {
      return;
    }

    const dateKey = toDateKey();
    const log = this.logs.get(dateKey) ?? this.createEmptyLog(dateKey);
    const existingIndex = log.meals.findIndex((meal) => meal.type === type);

    if (existingIndex >= 0) {
      this.subtractMealFromLog(log, log.meals[existingIndex]);
      log.meals.splice(existingIndex, 1);
    }

    const meal = this.createMealEntry(type, foods);
    this.addMealToLog(log, meal);
    this.logs.set(dateKey, log);

    await this.persistLogs();
    await this.refreshToday();
  }

  private createMealEntry(type: MealType, foods: Food[]): MealLogEntry {
    const calories = foods.reduce((total, food) => total + food.calories, 0);

    return {
      id: createId(),
      type,
      name: MEAL_TYPE_LABELS[type],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      foodCount: foods.length,
      calories,
      foodTags: foods.map((food) => toFoodTag(food.name)),
      foods: foods.map((food) => ({ ...food })),
    };
  }

  private addMealToLog(log: DailyLog, meal: MealLogEntry): void {
    log.meals.push(meal);
    log.calories += meal.calories;

    meal.foods.forEach((food) => {
      log.macros.protein += food.macros.protein;
      log.macros.carbs += food.macros.carbs;
      log.macros.fat += food.macros.fat;
      log.macros.sugar += food.macros.sugar;
    });
  }

  private subtractMealFromLog(log: DailyLog, meal: MealLogEntry): void {
    log.calories -= meal.calories;

    meal.foods.forEach((food) => {
      log.macros.protein -= food.macros.protein;
      log.macros.carbs -= food.macros.carbs;
      log.macros.fat -= food.macros.fat;
      log.macros.sugar -= food.macros.sugar;
    });
  }

  private buildMealSlots(dateKey: string): MealCategorySlot[] {
    const log = this.logs.get(dateKey);

    return MEAL_TYPE_OPTIONS.map((type) => ({
      type,
      label: MEAL_TYPE_LABELS[type],
      icon: MEAL_TYPE_ICONS[type],
      meal: log?.meals.find((entry) => entry.type === type) ?? null,
    }));
  }

  private createEmptyLog(dateKey: string): DailyLog {
    return {
      date: dateKey,
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, sugar: 0 },
      meals: [],
    };
  }

  private async persistLogs(): Promise<void> {
    const data: Record<string, DailyLog> = {};
    this.logs.forEach((value, key) => {
      data[key] = value;
    });
    await this.storage.set(STORAGE_KEYS.DAILY_LOGS, data);
  }

  private buildSummary(dateKey: string): DailySummary {
    const log = this.logs.get(dateKey);
    const goals = this.userService.getUser().goals;

    const calories = log?.calories ?? 0;
    const macros = log?.macros ?? { protein: 0, carbs: 0, fat: 0, sugar: 0 };
    const meals = log?.meals ?? [];

    return {
      calories,
      calorieGoal: goals.calories,
      caloriesRemaining: Math.max(goals.calories - calories, 0),
      calorieProgress: this.calculateProgress(calories, goals.calories),
      macros: this.buildMacroSummaries(macros, goals),
      meals: [...meals].sort((a, b) => a.time.localeCompare(b.time)),
    };
  }

  private buildMacroSummaries(macros: MacroNutrients, goals: MacroGoals): MacroSummary[] {
    return MACRO_CONFIG.map((config) => {
      const current = macros[config.key];
      const goal = goals[config.key];

      return {
        key: config.key,
        label: config.label,
        current,
        goal,
        unit: config.unit,
        color: config.color,
        progress: this.calculateProgress(current, goal),
      };
    });
  }

  private calculateProgress(current: number, goal: number): number {
    if (goal <= 0) {
      return 0;
    }

    return Math.min(Math.round((current / goal) * 100), 100);
  }
}
