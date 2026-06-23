import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_KEYS } from '../core/constants/storage-keys';
import { createDefaultUser } from '../core/constants/default-user';
import { MacroGoals, UserProfile, UserSettings, UserWeight, FitnessObjective } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userSubject = new BehaviorSubject<UserProfile>(createDefaultUser());
  readonly user$: Observable<UserProfile> = this.userSubject.asObservable();

  constructor(private readonly storage: StorageService) {}

  async load(): Promise<void> {
    const stored = await this.storage.get<Partial<UserProfile>>(STORAGE_KEYS.USER_PROFILE);

    if (!stored) {
      const user = createDefaultUser();
      await this.save(user);
      return;
    }

    this.userSubject.next(this.mergeUser(stored));
  }

  async save(user: UserProfile): Promise<void> {
    await this.storage.set(STORAGE_KEYS.USER_PROFILE, user);
    this.userSubject.next(user);
  }

  getUser(): UserProfile {
    return this.userSubject.value;
  }

  async updateGoals(goals: MacroGoals): Promise<void> {
    const user = { ...this.getUser(), goals };
    await this.save(user);
  }

  async updateGoalsProfile(payload: {
    goals: MacroGoals;
    weight: UserWeight;
    fitnessObjective: FitnessObjective;
  }): Promise<void> {
    const user = {
      ...this.getUser(),
      goals: payload.goals,
      weight: payload.weight,
      fitnessObjective: payload.fitnessObjective,
    };
    await this.save(user);
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const user = {
      ...this.getUser(),
      settings: { ...this.getUser().settings, ...settings },
    };
    await this.save(user);
  }

  private mergeUser(stored: Partial<UserProfile>): UserProfile {
    const defaults = createDefaultUser();

    return {
      ...defaults,
      ...stored,
      weight: { ...defaults.weight, ...stored.weight },
      goals: { ...defaults.goals, ...stored.goals },
      settings: { ...defaults.settings, ...stored.settings },
      fitnessObjective: stored.fitnessObjective ?? defaults.fitnessObjective,
      fullName: stored.fullName ?? defaults.fullName,
      name: stored.name ?? defaults.name,
      initials: stored.initials ?? defaults.initials,
    };
  }
}
