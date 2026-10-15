import { Injectable } from '@angular/core';
import { Observable, defer, map } from 'rxjs';
import { STORAGE_KEYS } from '../../core/constants/storage-keys';
import { DailyLog, Food, UserProfile } from '../../models';
import { StorageService } from '../storage.service';
import { DataStore } from './data-store';

export interface LocalDataSnapshot {
  profile: UserProfile | null;
  foods: Food[];
  logs: DailyLog[];
}

/** Dados salvos apenas no dispositivo, usados quando não há login. */
@Injectable({ providedIn: 'root' })
export class LocalDataStore implements DataStore {
  /** Fila para que leituras e escritas da mesma chave não se atropelem. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly storage: StorageService) {}

  profile$(): Observable<UserProfile | null> {
    return defer(() => this.readProfile());
  }

  foods$(): Observable<Food[]> {
    return defer(() => this.readFoods());
  }

  dailyLogs$(): Observable<DailyLog[]> {
    return defer(() => this.readLogs()).pipe(map((logs) => Object.values(logs)));
  }

  saveProfile(profile: UserProfile): Promise<void> {
    return this.enqueue(() => this.storage.set(STORAGE_KEYS.USER_PROFILE, profile));
  }

  saveFood(food: Food): Promise<void> {
    return this.enqueue(async () => {
      const foods = await this.readFoods();
      const index = foods.findIndex((item) => item.id === food.id);

      if (index >= 0) {
        foods[index] = food;
      } else {
        foods.push(food);
      }

      await this.storage.set(STORAGE_KEYS.FOOD_CATALOG, foods);
    });
  }

  deleteFood(id: string): Promise<void> {
    return this.enqueue(async () => {
      const foods = await this.readFoods();
      await this.storage.set(
        STORAGE_KEYS.FOOD_CATALOG,
        foods.filter((food) => food.id !== id),
      );
    });
  }

  saveDailyLog(log: DailyLog): Promise<void> {
    return this.enqueue(async () => {
      const logs = await this.readLogs();
      logs[log.date] = log;
      await this.storage.set(STORAGE_KEYS.DAILY_LOGS, logs);
    });
  }

  readProfile(): Promise<UserProfile | null> {
    return this.storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  readSnapshot(): Promise<LocalDataSnapshot> {
    return this.enqueue(async () => ({
      profile: await this.readProfile(),
      foods: await this.readFoods(),
      logs: Object.values(await this.readLogs()),
    }));
  }

  /** Remove alimentos e registros depois que já foram enviados para a nuvem. */
  clearSyncedData(): Promise<void> {
    return this.enqueue(async () => {
      await this.storage.remove(STORAGE_KEYS.FOOD_CATALOG);
      await this.storage.remove(STORAGE_KEYS.DAILY_LOGS);
    });
  }

  private async readFoods(): Promise<Food[]> {
    return (await this.storage.get<Food[]>(STORAGE_KEYS.FOOD_CATALOG)) ?? [];
  }

  private async readLogs(): Promise<Record<string, DailyLog>> {
    const stored = await this.storage.get<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS);
    const logs: Record<string, DailyLog> = {};

    Object.entries(stored ?? {}).forEach(([date, log]) => {
      logs[date] = { ...log, date };
    });

    return logs;
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }
}
