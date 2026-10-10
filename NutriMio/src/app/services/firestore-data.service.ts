import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../core/firebase/firebase';
import { DailyLog, Food, UserProfile } from '../models';
import { AuthService } from './auth.service';

/**
 * Estrutura no Firestore:
 *   users/{uid}                    -> { profile, localImportedAt }
 *   users/{uid}/foods/{foodId}     -> Food
 *   users/{uid}/dailyLogs/{date}   -> DailyLog (date = YYYY-MM-DD)
 */
interface UserDocument {
  profile?: UserProfile;
  localImportedAt?: Timestamp;
}

export interface LocalDataSnapshot {
  profile: UserProfile | null;
  foods: Food[];
  logs: DailyLog[];
}

/** Limite de operações por batch do Firestore. */
const BATCH_LIMIT = 450;

@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
  constructor(private readonly auth: AuthService) {}

  async getProfile(): Promise<UserProfile | null> {
    const snapshot = await getDoc(this.userDoc());
    return (snapshot.data() as UserDocument | undefined)?.profile ?? null;
  }

  saveProfile(profile: UserProfile): void {
    this.write(setDoc(this.userDoc(), { profile }, { merge: true }), 'perfil');
  }

  async getFoods(): Promise<Food[]> {
    const snapshot = await getDocs(collection(this.userDoc(), 'foods'));
    return snapshot.docs.map((item) => ({ ...(item.data() as Food), id: item.id }));
  }

  saveFood(food: Food): void {
    this.write(setDoc(doc(this.userDoc(), 'foods', food.id), food), 'alimento');
  }

  deleteFood(id: string): void {
    this.write(deleteDoc(doc(this.userDoc(), 'foods', id)), 'alimento');
  }

  async getDailyLogs(): Promise<DailyLog[]> {
    const snapshot = await getDocs(collection(this.userDoc(), 'dailyLogs'));
    return snapshot.docs.map((item) => ({ ...(item.data() as DailyLog), date: item.id }));
  }

  saveDailyLog(log: DailyLog): void {
    this.write(setDoc(doc(this.userDoc(), 'dailyLogs', log.date), log), 'registro diário');
  }

  /**
   * Envia para a nuvem os dados que só existiam no storage do dispositivo.
   * Roda uma única vez por conta e nunca sobrescreve o que já está na nuvem.
   */
  async importLocalDataOnce(local: LocalDataSnapshot): Promise<void> {
    const userSnapshot = await getDoc(this.userDoc());
    const userData = userSnapshot.data() as UserDocument | undefined;

    if (userData?.localImportedAt) {
      return;
    }

    const [cloudFoods, cloudLogs] = await Promise.all([this.getFoods(), this.getDailyLogs()]);
    const cloudFoodIds = new Set(cloudFoods.map((food) => food.id));
    const cloudLogDates = new Set(cloudLogs.map((log) => log.date));

    const writes: Array<[DocumentReference, object]> = [];

    for (const food of local.foods) {
      if (!cloudFoodIds.has(food.id)) {
        writes.push([doc(this.userDoc(), 'foods', food.id), food]);
      }
    }

    for (const log of local.logs) {
      if (!cloudLogDates.has(log.date)) {
        writes.push([doc(this.userDoc(), 'dailyLogs', log.date), log]);
      }
    }

    const userUpdate: UserDocument = { localImportedAt: Timestamp.now() };

    if (!userData?.profile && local.profile) {
      userUpdate.profile = local.profile;
    }

    // O marcador vai no último batch, assim só é gravado se todo o resto for enviado.
    writes.push([this.userDoc(), userUpdate]);

    for (let start = 0; start < writes.length; start += BATCH_LIMIT) {
      const batch = writeBatch(firestore);
      writes
        .slice(start, start + BATCH_LIMIT)
        .forEach(([ref, data]) => batch.set(ref, data, { merge: true }));
      this.write(batch.commit(), 'importação dos dados locais');
    }
  }

  private userDoc(): DocumentReference {
    return doc(firestore, 'users', this.auth.requireUid());
  }

  /**
   * As escritas vão primeiro para o cache local do Firestore e sincronizam
   * em segundo plano. Não aguardamos a confirmação do servidor para a UI
   * continuar funcionando offline.
   */
  private write(operation: Promise<void>, label: string): void {
    operation.catch((error) => {
      console.error(`[Firestore] Falha ao salvar ${label}`, error);
    });
  }
}
