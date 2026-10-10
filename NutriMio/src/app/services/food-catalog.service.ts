import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createId } from '../core/utils/meal.utils';
import { Food } from '../models';
import { FirestoreDataService } from './firestore-data.service';

@Injectable({ providedIn: 'root' })
export class FoodCatalogService {
  private readonly foodsSubject = new BehaviorSubject<Food[]>([]);
  readonly foods$: Observable<Food[]> = this.foodsSubject.asObservable();

  constructor(private readonly data: FirestoreDataService) {}

  async load(): Promise<void> {
    const foods = await this.data.getFoods();
    this.foodsSubject.next(foods.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
  }

  clear(): void {
    this.foodsSubject.next([]);
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
    this.data.saveFood(newFood);
    this.foodsSubject.next([...this.foodsSubject.value, newFood]);
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
    this.data.saveFood(updated);
    this.foodsSubject.next(foods);
    return updated;
  }

  async deleteFood(id: string): Promise<void> {
    this.data.deleteFood(id);
    this.foodsSubject.next(this.foodsSubject.value.filter((food) => food.id !== id));
  }
}
