import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { createId } from '../core/utils/meal.utils';
import { connectStream } from '../core/utils/stream.utils';
import { Food } from '../models';
import { DataRepository } from './data/data-repository.service';

@Injectable({ providedIn: 'root' })
export class FoodCatalogService {
  private readonly foodsSubject = new BehaviorSubject<Food[]>([]);
  readonly foods$: Observable<Food[]> = this.foodsSubject.asObservable();

  private subscription?: Subscription;

  constructor(private readonly data: DataRepository) {}

  /** Passa a acompanhar os alimentos da origem atual (dispositivo ou nuvem). */
  connect(): Promise<void> {
    this.disconnect();

    const connection = connectStream(
      this.data.foods$(),
      (foods) => this.foodsSubject.next(sortFoods(foods)),
      'alimentos',
    );
    this.subscription = connection.subscription;
    return connection.ready;
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
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
    await this.data.saveFood(newFood);
    this.foodsSubject.next(sortFoods([...this.foodsSubject.value, newFood]));
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
    await this.data.saveFood(updated);
    this.foodsSubject.next(sortFoods(foods));
    return updated;
  }

  async deleteFood(id: string): Promise<void> {
    await this.data.deleteFood(id);
    this.foodsSubject.next(this.foodsSubject.value.filter((food) => food.id !== id));
  }
}

function sortFoods(foods: Food[]): Food[] {
  return [...foods].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
