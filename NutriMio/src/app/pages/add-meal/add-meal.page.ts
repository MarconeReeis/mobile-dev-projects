import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  libraryOutline,
  saveOutline,
} from 'ionicons/icons';
import { buildMealSummary } from '../../core/utils/meal.utils';
import {
  Food,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_OPTIONS,
  MealType,
} from '../../models';
import { FoodCatalogService } from '../../services/food-catalog.service';
import { NutritionService } from '../../services/nutrition.service';
import { FoodSelectItemComponent } from '../../shared/components/food-select-item/food-select-item.component';
import { MealSummaryCardComponent } from '../../shared/components/meal-summary-card/meal-summary-card.component';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.page.html',
  styleUrls: ['./add-meal.page.scss'],
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    FoodSelectItemComponent,
    MealSummaryCardComponent,
  ],
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
  readonly selectedType = signal<MealType>('breakfast');
  readonly selectedFoodIds = signal<Set<string>>(new Set());

  readonly selectedFoods = computed(() =>
    this.catalogFoods().filter((food) => this.selectedFoodIds().has(food.id)),
  );

  readonly summary = computed(() => buildMealSummary(this.selectedFoods()));

  isSaving = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      addOutline,
      saveOutline,
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
        this.selectedFoodIds.update((ids) => new Set([...ids, selectFood]));
      }
    });
  }

  private loadSelectionForType(type: MealType): void {
    const meal = this.nutritionService
      .getTodayMealSlots()
      .find((slot) => slot.type === type)?.meal;

    if (meal) {
      this.selectedFoodIds.set(new Set(meal.foods.map((food) => food.id)));
      return;
    }

    this.selectedFoodIds.set(new Set());
  }

  goBack(): void {
    this.location.back();
  }

  selectMealType(type: MealType): void {
    this.selectedType.set(type);
    this.loadSelectionForType(type);
  }

  isSelected(foodId: string): boolean {
    return this.selectedFoodIds().has(foodId);
  }

  toggleFood(foodId: string): void {
    this.selectedFoodIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(foodId)) {
        next.delete(foodId);
      } else {
        next.add(foodId);
      }
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
    const foods = this.selectedFoods();

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
