import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_KEYS } from '../core/constants/storage-keys';
import { createId } from '../core/utils/meal.utils';
import { Food } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class FoodCatalogService {
  private readonly foodsSubject = new BehaviorSubject<Food[]>([]);
  readonly foods$: Observable<Food[]> = this.foodsSubject.asObservable();

  constructor(private readonly storage: StorageService) {}

  async load(): Promise<void> {
    const stored = await this.storage.get<Food[]>(STORAGE_KEYS.FOOD_CATALOG);
    const foods = stored ?? [];
    this.foodsSubject.next(foods);

    if (!stored) {
      await this.persist(foods);
    }
  }

  getFoods(): Food[] {
    return this.foodsSubject.value;
  }

  hasFoods(): boolean {
    return this.foodsSubject.value.length > 0;
  }

  getFoodById(id: string): Food | undefined {
    return this.foodsSubject.value.find((food) => food.id === id);
  }

  getFoodsByIds(ids: string[]): Food[] {
    const map = new Map(this.foodsSubject.value.map((food) => [food.id, food]));
    return ids.map((id) => map.get(id)).filter((food): food is Food => !!food);
  }

  async addFood(food: Omit<Food, 'id'>): Promise<Food> {
    const newFood: Food = { ...food, id: createId() };
    const foods = [...this.foodsSubject.value, newFood];
    await this.persist(foods);
    this.foodsSubject.next(foods);
    return newFood;
  }

  async updateFood(id: string, food: Omit<Food, 'id'>): Promise<Food | undefined> {
    const foods = [...this.foodsSubject.value];
    const index = foods.findIndex((item) => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const updated: Food = { ...food, id };
    foods[index] = updated;
    await this.persist(foods);
    this.foodsSubject.next(foods);
    return updated;
  }

  async deleteFood(id: string): Promise<void> {
    const foods = this.foodsSubject.value.filter((food) => food.id !== id);
    await this.persist(foods);
    this.foodsSubject.next(foods);
  }

  private async persist(foods: Food[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.FOOD_CATALOG, foods);
  }
}
