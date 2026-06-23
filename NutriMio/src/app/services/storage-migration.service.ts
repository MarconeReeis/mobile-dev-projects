import { Injectable } from '@angular/core';
import { STORAGE_KEYS, CURRENT_DATA_MIGRATION_VERSION } from '../core/constants/storage-keys';
import { createDefaultUser } from '../core/constants/default-user';
import { UserProfile } from '../models';
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

    await this.storage.set(
      STORAGE_KEYS.DATA_MIGRATION_VERSION,
      CURRENT_DATA_MIGRATION_VERSION,
    );
  }
}
