import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { createDefaultUser } from '../core/constants/default-user';
import { connectStream } from '../core/utils/stream.utils';
import { MacroGoals, UserProfile, UserSettings, UserWeight, FitnessObjective } from '../models';
import { DataRepository } from './data/data-repository.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userSubject = new BehaviorSubject<UserProfile>(createDefaultUser());
  readonly user$: Observable<UserProfile> = this.userSubject.asObservable();

  private subscription?: Subscription;

  constructor(private readonly data: DataRepository) {}

  /**
   * Passa a acompanhar o perfil da origem atual. Com login, `account`
   * é usado para criar o perfil na primeira vez que a conta é usada.
   */
  connect(account: User | null): Promise<void> {
    this.disconnect();

    const connection = connectStream(
      this.data.profile$(),
      async (stored) => {
        if (stored) {
          this.userSubject.next(this.mergeUser(stored));
          return;
        }

        await this.save(await this.createInitialProfile(account));
      },
      'perfil',
    );
    this.subscription = connection.subscription;
    return connection.ready;
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.userSubject.next(createDefaultUser());
  }

  async save(user: UserProfile): Promise<void> {
    await this.data.saveProfile(user);
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

  /** Na primeira vez com login, aproveita as metas que já estavam no dispositivo. */
  private async createInitialProfile(account: User | null): Promise<UserProfile> {
    if (!account) {
      return createDefaultUser();
    }

    const localProfile = await this.data.readLocalProfile();
    const base = localProfile ? this.mergeUser(localProfile) : createDefaultUser();
    const fullName = account.displayName?.trim() || base.fullName;
    const parts = fullName.split(/\s+/);
    const initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();

    return {
      ...base,
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
