import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyLog, Food, UserProfile } from '../../models';
import { DataStore } from './data-store';
import { FirestoreDataStore } from './firestore-data-store';
import { LocalDataStore } from './local-data-store';

/**
 * Ponto único de acesso aos dados. Sem login usa o storage do dispositivo;
 * com login usa o Firestore da conta.
 */
@Injectable({ providedIn: 'root' })
export class DataRepository implements DataStore {
  private cloud: FirestoreDataStore | null = null;

  constructor(
    private readonly local: LocalDataStore,
    private readonly zone: NgZone,
  ) {}

  get isCloud(): boolean {
    return this.cloud !== null;
  }

  useLocal(): void {
    this.cloud = null;
  }

  useCloud(uid: string): void {
    this.cloud = new FirestoreDataStore(uid, this.zone);
  }

  profile$(): Observable<UserProfile | null> {
    return this.store.profile$();
  }

  foods$(): Observable<Food[]> {
    return this.store.foods$();
  }

  dailyLogs$(): Observable<DailyLog[]> {
    return this.store.dailyLogs$();
  }

  saveProfile(profile: UserProfile): Promise<void> {
    return this.store.saveProfile(profile);
  }

  saveFood(food: Food): Promise<void> {
    return this.store.saveFood(food);
  }

  deleteFood(id: string): Promise<void> {
    return this.store.deleteFood(id);
  }

  saveDailyLog(log: DailyLog): Promise<void> {
    return this.store.saveDailyLog(log);
  }

  /** Perfil salvo no dispositivo, usado como base ao criar o perfil da conta. */
  readLocalProfile(): Promise<UserProfile | null> {
    return this.local.readProfile();
  }

  /**
   * Leva para a conta o que foi cadastrado sem login e, depois que o servidor
   * confirmar, limpa essa cópia do dispositivo.
   */
  async importGuestDataToCloud(): Promise<void> {
    const cloud = this.cloud;

    if (!cloud) {
      return;
    }

    const snapshot = await this.local.readSnapshot();

    if (!snapshot.foods.length && !snapshot.logs.length) {
      return;
    }

    const imported = await cloud.importGuestData(snapshot);
    await this.local.clearSyncedData();
    console.info(`[Dados] ${imported} itens do dispositivo enviados para a nuvem`);
  }

  private get store(): DataStore {
    return this.cloud ?? this.local;
  }
}
