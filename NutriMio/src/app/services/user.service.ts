import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { createDefaultUser } from '../core/constants/default-user';
import { MacroGoals, UserProfile, UserSettings, UserWeight, FitnessObjective } from '../models';
import { FirestoreDataService } from './firestore-data.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userSubject = new BehaviorSubject<UserProfile>(createDefaultUser());
  readonly user$: Observable<UserProfile> = this.userSubject.asObservable();

  constructor(private readonly data: FirestoreDataService) {}

  async load(account: User): Promise<void> {
    const stored = await this.data.getProfile();

    if (!stored) {
      await this.save(this.createProfileFromAccount(account));
      return;
    }

    this.userSubject.next(this.mergeUser(stored));
  }

  clear(): void {
    this.userSubject.next(createDefaultUser());
  }

  async save(user: UserProfile): Promise<void> {
    this.data.saveProfile(user);
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
    age: number;
    settings: UserSettings;
  }): Promise<void> {
    const user = {
      ...this.getUser(),
      goals: payload.goals,
      weight: payload.weight,
      fitnessObjective: payload.fitnessObjective,
      age: payload.age,
      settings: payload.settings,
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

  private createProfileFromAccount(account: User): UserProfile {
    const defaults = createDefaultUser();
    const fullName = account.displayName?.trim() || defaults.fullName;
    const parts = fullName.split(/\s+/);
    const initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();

    return {
      ...defaults,
      id: account.uid,
      fullName,
      name: parts[0],
      initials,
      email: account.email ?? '',
    };
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
      age: stored.age ?? defaults.age,
      fullName: stored.fullName ?? defaults.fullName,
      name: stored.name ?? defaults.name,
      initials: stored.initials ?? defaults.initials,
    };
  }
}
