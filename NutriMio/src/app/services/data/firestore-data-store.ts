import { NgZone } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Query,
  QuerySnapshot,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { firestore } from '../../core/firebase/firebase';
import { DailyLog, Food, UserProfile } from '../../models';
import { DataStore } from './data-store';
import { LocalDataSnapshot } from './local-data-store';

/**
 * Estrutura no Firestore:
 *   users/{uid}                    -> { profile }
 *   users/{uid}/foods/{foodId}     -> Food
 *   users/{uid}/dailyLogs/{date}   -> DailyLog (date = YYYY-MM-DD)
 */
interface UserDocument {
  profile?: UserProfile;
}

/** Limite de operações por batch do Firestore. */
const BATCH_LIMIT = 450;

/**
 * Usa listeners em tempo real: a primeira emissão vem do cache do
 * dispositivo (instantânea) e as seguintes chegam conforme o servidor
 * responde, inclusive alterações feitas em outro aparelho.
 */
export class FirestoreDataStore implements DataStore {
  private readonly userDoc: DocumentReference;
  private readonly foodsCollection: CollectionReference;
  private readonly logsCollection: CollectionReference;

  constructor(
    uid: string,
    private readonly zone: NgZone,
  ) {
    this.userDoc = doc(firestore, 'users', uid);
    this.foodsCollection = collection(this.userDoc, 'foods');
    this.logsCollection = collection(this.userDoc, 'dailyLogs');
  }

  profile$(): Observable<UserProfile | null> {
    return new Observable((subscriber) =>
      onSnapshot(
        this.userDoc,
        (snapshot) => {
          // Sem o documento no cache não dá para saber se ele existe:
          // aguarda o servidor para não criar um perfil por cima do real.
          if (!snapshot.exists() && snapshot.metadata.fromCache) {
            return;
          }

          const profile = (snapshot.data() as UserDocument | undefined)?.profile ?? null;
          this.zone.run(() => subscriber.next(profile));
        },
        (error) => this.zone.run(() => subscriber.error(error)),
      ),
    );
  }

  foods$(): Observable<Food[]> {
    return this.watchCollection(this.foodsCollection, (snapshot) =>
      snapshot.docs.map((item) => ({ ...(item.data() as Food), id: item.id })),
    );
  }

  dailyLogs$(): Observable<DailyLog[]> {
    return this.watchCollection(this.logsCollection, (snapshot) =>
      snapshot.docs.map((item) => ({ ...(item.data() as DailyLog), date: item.id })),
    );
  }

  // As escritas entram no cache local na hora e sincronizam em segundo plano;
  // não esperamos o servidor para a UI continuar rápida (e funcionar offline).

  saveProfile(profile: UserProfile): Promise<void> {
    this.write(setDoc(this.userDoc, { profile }, { merge: true }), 'perfil');
    return Promise.resolve();
  }

  saveFood(food: Food): Promise<void> {
    this.write(setDoc(doc(this.foodsCollection, food.id), food), 'alimento');
    return Promise.resolve();
  }

  deleteFood(id: string): Promise<void> {
    this.write(deleteDoc(doc(this.foodsCollection, id)), 'alimento');
    return Promise.resolve();
  }

  saveDailyLog(log: DailyLog): Promise<void> {
    this.write(setDoc(doc(this.logsCollection, log.date), log), 'registro diário');
    return Promise.resolve();
  }

  /**
   * Envia os alimentos e registros criados sem login, sem sobrescrever o que já
   * existe na nuvem. Resolve só depois que o servidor confirmar a gravação.
   */
  async importGuestData(local: LocalDataSnapshot): Promise<number> {
    const [cloudFoods, cloudLogs] = await Promise.all([
      getDocs(this.foodsCollection),
      getDocs(this.logsCollection),
    ]);
    const cloudFoodIds = new Set(cloudFoods.docs.map((item) => item.id));
    const cloudLogDates = new Set(cloudLogs.docs.map((item) => item.id));

    const writes: Array<[DocumentReference, object]> = [
      ...local.foods
        .filter((food) => !cloudFoodIds.has(food.id))
        .map((food): [DocumentReference, object] => [doc(this.foodsCollection, food.id), food]),
      ...local.logs
        .filter((log) => !cloudLogDates.has(log.date))
        .map((log): [DocumentReference, object] => [doc(this.logsCollection, log.date), log]),
    ];

    for (let start = 0; start < writes.length; start += BATCH_LIMIT) {
      const batch = writeBatch(firestore);
      writes.slice(start, start + BATCH_LIMIT).forEach(([ref, data]) => batch.set(ref, data));
      await batch.commit();
    }

    return writes.length;
  }

  private watchCollection<T>(
    query: Query,
    mapSnapshot: (snapshot: QuerySnapshot) => T,
  ): Observable<T> {
    return new Observable((subscriber) =>
      onSnapshot(
        query,
        (snapshot) => this.zone.run(() => subscriber.next(mapSnapshot(snapshot))),
        (error) => this.zone.run(() => subscriber.error(error)),
      ),
    );
  }

  private write(operation: Promise<void>, label: string): void {
    operation.catch((error) => console.error(`[Firestore] Falha ao salvar ${label}`, error));
  }
}
