import { Observable } from 'rxjs';
import { DailyLog, Food, UserProfile } from '../../models';

/**
 * Contrato comum entre o storage do dispositivo (sem login)
 * e o Firestore (com login).
 */
export interface DataStore {
  /** Emite `null` quando ainda não existe perfil salvo. */
  profile$(): Observable<UserProfile | null>;
  foods$(): Observable<Food[]>;
  dailyLogs$(): Observable<DailyLog[]>;

  saveProfile(profile: UserProfile): Promise<void>;
  saveFood(food: Food): Promise<void>;
  deleteFood(id: string): Promise<void>;
  saveDailyLog(log: DailyLog): Promise<void>;
}
