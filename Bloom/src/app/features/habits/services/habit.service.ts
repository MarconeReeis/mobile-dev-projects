import { Injectable, computed, inject, signal } from '@angular/core';
import { COLOR_PRESETS, EMOJI_PRESETS } from '../../../core/constants/habit-presets';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { Habit, HabitFormValues } from '../../../core/models/habit.model';
import { StorageService } from '../../../core/services/storage.service';
import { createHabitId } from '../utils/habit.utils';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly storage = inject(StorageService);

  private readonly habitsState = signal<Habit[]>(this.loadFromStorage());

  readonly habits = this.habitsState.asReadonly();
  readonly isEmpty = computed(() => this.habitsState().length === 0);

  addHabit(values: HabitFormValues): Habit {
    const habit: Habit = {
      id: createHabitId(),
      name: values.name.trim(),
      emoji: values.emoji,
      color: values.color,
      startedAt: values.startedAt,
      createdAt: Date.now(),
      relapses: 0,
      longestStreakMs: 0,
    };

    this.persist([habit, ...this.habitsState()]);
    return habit;
  }

  updateHabit(id: string, values: HabitFormValues): Habit | null {
    return this.patchHabit(id, {
      name: values.name.trim(),
      emoji: values.emoji,
      color: values.color,
      startedAt: values.startedAt,
    });
  }

  recordRelapse(id: string): Habit | null {
    const habit = this.getById(id);
    if (!habit) {
      return null;
    }

    const now = Date.now();
    const currentStreakMs = now - habit.startedAt;

    return this.patchHabit(id, {
      startedAt: now,
      relapses: habit.relapses + 1,
      longestStreakMs: Math.max(habit.longestStreakMs, currentStreakMs),
    });
  }

  deleteHabit(id: string): void {
    this.persist(this.habitsState().filter((habit) => habit.id !== id));
  }

  getById(id: string): Habit | undefined {
    return this.habitsState().find((habit) => habit.id === id);
  }

  getDefaultFormValues(): HabitFormValues {
    return {
      name: '',
      emoji: EMOJI_PRESETS[0],
      color: COLOR_PRESETS[0],
      startedAt: Date.now(),
    };
  }

  private patchHabit(id: string, patch: Partial<Habit>): Habit | null {
    let updated: Habit | null = null;

    const next = this.habitsState().map((habit) => {
      if (habit.id !== id) {
        return habit;
      }
      updated = { ...habit, ...patch };
      return updated;
    });

    if (!updated) {
      return null;
    }

    this.persist(next);
    return updated;
  }

  private persist(habits: Habit[]): void {
    this.habitsState.set(habits);
    this.storage.set(STORAGE_KEYS.habits, habits);
  }

  private loadFromStorage(): Habit[] {
    return this.migrate(this.storage.get<Habit[]>(STORAGE_KEYS.habits) ?? []);
  }

  /** Compatibilidade com dados salvos na estrutura anterior. */
  private migrate(raw: unknown[]): Habit[] {
    return raw
      .map((item) => this.normalizeHabit(item))
      .filter((habit): habit is Habit => habit !== null);
  }

  private normalizeHabit(item: unknown): Habit | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const record = item as Record<string, unknown>;

    if (typeof record['id'] !== 'string' || typeof record['name'] !== 'string') {
      return null;
    }

    if (typeof record['startedAt'] === 'number') {
      return record as unknown as Habit;
    }

    const startedAtRaw = record['startedAt'];
    const startedAt =
      typeof startedAtRaw === 'string' ? new Date(startedAtRaw).getTime() : Date.now();

    return {
      id: record['id'],
      name: record['name'],
      emoji: typeof record['emoji'] === 'string' ? record['emoji'] : EMOJI_PRESETS[0],
      color: typeof record['color'] === 'string' ? record['color'] : COLOR_PRESETS[0],
      startedAt: Number.isFinite(startedAt) ? startedAt : Date.now(),
      createdAt:
        typeof record['createdAt'] === 'number'
          ? record['createdAt']
          : Date.now(),
      relapses: typeof record['relapses'] === 'number' ? record['relapses'] : 0,
      longestStreakMs:
        typeof record['longestStreakMs'] === 'number' ? record['longestStreakMs'] : 0,
    };
  }
}
