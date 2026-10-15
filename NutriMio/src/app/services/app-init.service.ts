import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { delay } from '../core/utils/stream.utils';
import { AuthService } from './auth.service';
import { DataRepository } from './data/data-repository.service';
import { FoodCatalogService } from './food-catalog.service';
import { NutritionService } from './nutrition.service';
import { StorageMigrationService } from './storage-migration.service';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

/**
 * Tempo máximo esperando a primeira leitura dos dados. Passado isso o app abre
 * mesmo assim e as telas se atualizam sozinhas quando os dados chegarem.
 */
const SESSION_READY_TIMEOUT_MS = 3000;

@Injectable({ providedIn: 'root' })
export class AppInitService {
  constructor(
    private readonly storage: StorageService,
    private readonly migration: StorageMigrationService,
    private readonly auth: AuthService,
    private readonly data: DataRepository,
    private readonly userService: UserService,
    private readonly foodCatalog: FoodCatalogService,
    private readonly nutritionService: NutritionService,
  ) {}

  async init(): Promise<void> {
    await this.storage.init();
    await this.migration.run();
    await this.startSession(await this.auth.waitForAuthReady());
  }

  /**
   * Sem login os dados ficam no dispositivo; com login, no Firestore da conta.
   */
  async startSession(account: User | null): Promise<void> {
    this.disconnect();

    if (account) {
      this.data.useCloud(account.uid);
      this.data
        .importGuestDataToCloud()
        .catch((error) => console.warn('[AppInit] Dados do dispositivo serão enviados depois', error));
    } else {
      this.data.useLocal();
    }

    const ready = Promise.all([
      this.userService.connect(account),
      this.foodCatalog.connect(),
      this.nutritionService.connect(),
    ]);

    await Promise.race([ready, delay(SESSION_READY_TIMEOUT_MS)]);
  }

  async signOut(): Promise<void> {
    // Encerra os listeners antes do logout para o Firestore não negar acesso a eles.
    this.disconnect();
    await this.auth.signOutUser();
    await this.startSession(null);
  }

  private disconnect(): void {
    this.userService.disconnect();
    this.foodCatalog.disconnect();
    this.nutritionService.disconnect();
  }
}

export function appInitializerFactory(appInit: AppInitService): () => Promise<void> {
  return () => appInit.init();
}
