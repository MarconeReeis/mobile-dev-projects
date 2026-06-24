import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  libraryOutline,
  saveOutline,
  searchOutline,
} from 'ionicons/icons';
import {
  getReferenceQuantity,
  scaleFoodToQuantity,
} from '../../core/utils/meal.utils';
import {
  Food,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_OPTIONS,
  MealType,
} from '../../models';
import { FoodCatalogService } from '../../services/food-catalog.service';
import { NutritionService } from '../../services/nutrition.service';
import { FoodSelectItemComponent } from '../../shared/components/food-select-item/food-select-item.component';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.page.html',
  styleUrls: ['./add-meal.page.scss'],
  imports: [IonContent, IonIcon, FoodSelectItemComponent],
})
export class AddMealPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly nutritionService = inject(NutritionService);
  private readonly foodCatalog = inject(FoodCatalogService);

  readonly mealTypeOptions = MEAL_TYPE_OPTIONS;
  readonly mealTypeLabels = MEAL_TYPE_LABELS;

  readonly catalogFoods = signal<Food[]>([]);
  readonly searchQuery = signal('');
  readonly selectedType = signal<MealType>('breakfast');
  readonly selectedItems = signal<Map<string, number>>(new Map());

  readonly filteredFoods = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.catalogFoods();
    }

    return this.catalogFoods().filter((food) =>
      food.name.toLowerCase().includes(query),
    );
  });

  readonly selectedMealFoods = computed(() => {
    const items = this.selectedItems();

    return this.catalogFoods()
      .filter((food) => items.has(food.id))
      .map((food) => scaleFoodToQuantity(food, items.get(food.id)!));
  });

  isSaving = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      addOutline,
      saveOutline,
      searchOutline,
      libraryOutline,
    });
  }

  ngOnInit(): void {
    this.foodCatalog.foods$.subscribe((foods) => this.catalogFoods.set(foods));

    this.route.queryParamMap.subscribe((params) => {
      const type = params.get('type') as MealType | null;
      if (type && MEAL_TYPE_OPTIONS.includes(type)) {
        this.selectedType.set(type);
      }

      this.loadSelectionForType(this.selectedType());

      const selectFood = params.get('selectFood');
      if (selectFood) {
        this.selectFoodWithDefaultQuantity(selectFood);
      }
    });
  }

  private loadSelectionForType(type: MealType): void {
    const meal = this.nutritionService
      .getTodayMealSlots()
      .find((slot) => slot.type === type)?.meal;

    if (meal) {
      const items = new Map<string, number>();
      meal.foods.forEach((savedFood) => {
        items.set(savedFood.id, savedFood.quantity);
      });
      this.selectedItems.set(items);
      return;
    }

    this.selectedItems.set(new Map());
  }

  private selectFoodWithDefaultQuantity(foodId: string): void {
    const food = this.catalogFoods().find((item) => item.id === foodId);

    if (!food) {
      return;
    }

    this.selectedItems.update((items) => {
      const next = new Map(items);
      next.set(foodId, getReferenceQuantity(food));
      return next;
    });
  }

  goBack(): void {
    this.location.back();
  }

  selectMealType(type: MealType): void {
    this.selectedType.set(type);
    this.loadSelectionForType(type);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  isSelected(foodId: string): boolean {
    return this.selectedItems().has(foodId);
  }

  getConsumedQuantity(foodId: string): number | null {
    return this.selectedItems().get(foodId) ?? null;
  }

  toggleFood(foodId: string): void {
    const food = this.catalogFoods().find((item) => item.id === foodId);

    if (!food) {
      return;
    }

    this.selectedItems.update((items) => {
      const next = new Map(items);

      if (next.has(foodId)) {
        next.delete(foodId);
      } else {
        next.set(foodId, getReferenceQuantity(food));
      }

      return next;
    });
  }

  removeFood(foodId: string): void {
    this.selectedItems.update((items) => {
      const next = new Map(items);
      next.delete(foodId);
      return next;
    });
  }

  updateConsumedQuantity(foodId: string, consumedQuantity: number): void {
    if (consumedQuantity <= 0) {
      return;
    }

    this.selectedItems.update((items) => {
      if (!items.has(foodId)) {
        return items;
      }

      const next = new Map(items);
      next.set(foodId, consumedQuantity);
      return next;
    });
  }

  onRegisterFood(): void {
    void this.router.navigate(['/tabs/meals/foods/add'], {
      queryParams: { returnTo: 'add-meal', type: this.selectedType() },
    });
  }

  onOpenCatalog(): void {
    void this.router.navigate(['/tabs/meals/foods']);
  }

  async onSave(): Promise<void> {
    const foods = this.selectedMealFoods();

    if (this.isSaving || !foods.length) {
      return;
    }

    this.isSaving = true;

    try {
      await this.nutritionService.saveMealForToday(this.selectedType(), foods);
      await this.router.navigate(['/tabs/meals']);
    } finally {
      this.isSaving = false;
    }
  }
}
