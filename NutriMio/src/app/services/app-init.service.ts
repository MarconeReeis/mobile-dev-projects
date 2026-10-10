import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { STORAGE_KEYS } from '../core/constants/storage-keys';
import { DailyLog, Food, UserProfile } from '../models';
import { AuthService } from './auth.service';
import { FirestoreDataService } from './firestore-data.service';
import { FoodCatalogService } from './food-catalog.service';
import { NutritionService } from './nutrition.service';
import { StorageMigrationService } from './storage-migration.service';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  constructor(
    private readonly storage: StorageService,
    private readonly migration: StorageMigrationService,
    private readonly auth: AuthService,
    private readonly data: FirestoreDataService,
    private readonly userService: UserService,
    private readonly foodCatalog: FoodCatalogService,
    private readonly nutritionService: NutritionService,
  ) {}

  async init(): Promise<void> {
    await this.storage.init();
    await this.migration.run();

    const user = await this.auth.waitForAuthReady();

    if (user) {
      await this.startSession(user);
    }
  }

  /** Carrega os dados do usuário logado a partir do Firestore. */
  async startSession(user: User): Promise<void> {
    try {
      await this.importLocalData();
    } catch (error) {
      // Sem conexão: tenta de novo na próxima abertura do app.
      console.warn('[AppInit] Importação dos dados locais adiada', error);
    }

    await Promise.all([
      this.userService.load(user).catch((error) => this.logLoadError('perfil', error)),
      this.foodCatalog.load().catch((error) => this.logLoadError('alimentos', error)),
      this.nutritionService.load().catch((error) => this.logLoadError('registros', error)),
    ]);
  }

  async endSession(): Promise<void> {
    await this.auth.signOutUser();
    this.userService.clear();
    this.foodCatalog.clear();
    this.nutritionService.clear();
  }

  /**
   * Os dados antigos do storage do dispositivo são mantidos como backup;
   * apenas copiamos para a nuvem na primeira vez que a conta é usada.
   */
  private async importLocalData(): Promise<void> {
    const [profile, foods, logs] = await Promise.all([
      this.storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE),
      this.storage.get<Food[]>(STORAGE_KEYS.FOOD_CATALOG),
      this.storage.get<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS),
    ]);

    await this.data.importLocalDataOnce({
      profile,
      foods: foods ?? [],
      logs: Object.entries(logs ?? {}).map(([date, log]) => ({ ...log, date })),
    });
  }

  private logLoadError(label: string, error: unknown): void {
    console.error(`[AppInit] Falha ao carregar ${label}`, error);
  }
}

export function appInitializerFactory(appInit: AppInitService): () => Promise<void> {
  return () => appInit.init();
}
