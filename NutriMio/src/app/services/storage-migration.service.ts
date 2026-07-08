import { Injectable } from '@angular/core';
import { STORAGE_KEYS, CURRENT_DATA_MIGRATION_VERSION } from '../core/constants/storage-keys';
import { calculateSuggestedWaterGoal } from '../core/utils/goals-calculator';
import { createDefaultUser } from '../core/constants/default-user';
import { DailyLog, UserProfile } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class StorageMigrationService {
  constructor(private readonly storage: StorageService) {}

  async run(): Promise<void> {
    const currentVersion =
      (await this.storage.get<number>(STORAGE_KEYS.DATA_MIGRATION_VERSION)) ?? 0;

    if (currentVersion >= CURRENT_DATA_MIGRATION_VERSION) {
      return;
    }

    if (currentVersion < 4) {
      const hadLegacySeed = (await this.storage.get<number>(STORAGE_KEYS.SEED_VERSION)) != null;

      if (hadLegacySeed) {
        await this.storage.remove(STORAGE_KEYS.DAILY_LOGS);
        await this.storage.remove(STORAGE_KEYS.FOOD_CATALOG);
        await this.storage.remove(STORAGE_KEYS.SEED_VERSION);
        await this.storage.set(STORAGE_KEYS.USER_PROFILE, createDefaultUser());
      } else {
        const profile = await this.storage.get<Partial<UserProfile>>(STORAGE_KEYS.USER_PROFILE);

        if (!profile) {
          await this.storage.set(STORAGE_KEYS.USER_PROFILE, createDefaultUser());
        } else if (profile.name === 'Marina' || profile.fullName === 'Marina Ribeiro') {
          const updated = {
            ...createDefaultUser(),
            ...profile,
            name: 'Marcone',
            fullName: 'Marcone Reis',
            initials: 'MR',
            weight: { ...createDefaultUser().weight, ...profile.weight },
            goals: { ...createDefaultUser().goals, ...profile.goals },
            settings: { ...createDefaultUser().settings, ...profile.settings },
          };
          await this.storage.set(STORAGE_KEYS.USER_PROFILE, updated);
        }
      }
    }

    if (currentVersion < 5) {
      await this.migrateMealReferenceQuantities();
    }

    if (currentVersion < 6) {
      await this.migrateUserWaterPreferences();
    }

    await this.storage.set(
      STORAGE_KEYS.DATA_MIGRATION_VERSION,
      CURRENT_DATA_MIGRATION_VERSION,
    );
  }

  private async migrateMealReferenceQuantities(): Promise<void> {
    const stored = await this.storage.get<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS);

    if (!stored) {
      return;
    }

    let changed = false;

    for (const log of Object.values(stored)) {
      for (const meal of log.meals) {
        for (const food of meal.foods) {
          if (food.referenceQuantity == null) {
            food.referenceQuantity = food.quantity;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      await this.storage.set(STORAGE_KEYS.DAILY_LOGS, stored);
    }
  }

  private async migrateUserWaterPreferences(): Promise<void> {
    const defaults = createDefaultUser();
    const profile = await this.storage.get<Partial<UserProfile>>(STORAGE_KEYS.USER_PROFILE);

    if (!profile) {
      return;
    }

    const age = profile.age ?? defaults.age;
    const currentWeight = profile.weight?.current ?? defaults.weight.current;
    const waterGoalAuto = profile.settings?.waterGoalAuto ?? true;
    const hydrationReminderInterval = profile.settings?.hydrationReminderInterval ?? 'off';
    const goals = {
      ...defaults.goals,
      ...profile.goals,
      waterMl: waterGoalAuto
        ? calculateSuggestedWaterGoal(currentWeight, age)
        : (profile.goals?.waterMl ?? defaults.goals.waterMl),
    };

    await this.storage.set(STORAGE_KEYS.USER_PROFILE, {
      ...defaults,
      ...profile,
      age,
      goals,
      weight: { ...defaults.weight, ...profile.weight },
      settings: {
        ...defaults.settings,
        ...profile.settings,
        waterGoalAuto,
        hydrationReminderInterval,
      },
    });
  }
}
