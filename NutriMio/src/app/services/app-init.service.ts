import { Injectable } from '@angular/core';
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
    private readonly userService: UserService,
    private readonly foodCatalog: FoodCatalogService,
    private readonly nutritionService: NutritionService,
  ) {}

  async init(): Promise<void> {
    await this.storage.init();
    await this.migration.run();
    await this.userService.load();
    await this.foodCatalog.load();
    await this.nutritionService.load();
  }
}

export function appInitializerFactory(appInit: AppInitService): () => Promise<void> {
  return () => appInit.init();
}
