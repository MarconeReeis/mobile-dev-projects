import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  chevronDownOutline,
  chevronUpOutline,
  sparklesOutline,
} from 'ionicons/icons';
import {
  MICRONUTRIENT_FIELDS,
  Food,
  MacroNutrients,
  Micronutrients,
  createEmptyMicronutrients,
} from '../../models';
import { FoodCatalogService } from '../../services/food-catalog.service';

const FOOD_UNITS = ['g', 'ml', 'un'] as const;

@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.page.html',
  styleUrls: ['./add-food.page.scss'],
  imports: [FormsModule, IonContent, IonIcon],
})
export class AddFoodPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly foodCatalog = inject(FoodCatalogService);

  readonly micronutrientFields = MICRONUTRIENT_FIELDS;

  foodId: string | null = null;
  name = '';
  quantity = 100;
  unit = 'g';
  calories = 0;
  protein = 0;
  carbs = 0;
  fat = 0;
  sugar = 0;
  micronutrients: Micronutrients = createEmptyMicronutrients();
  micronutrientsOpen = false;
  isSaving = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      chevronDownOutline,
      chevronUpOutline,
      sparklesOutline,
    });
  }

  ngOnInit(): void {
    this.foodId = this.route.snapshot.queryParamMap.get('foodId');

    if (!this.foodId) {
      return;
    }

    const food = this.foodCatalog.getFoodById(this.foodId);

    if (!food) {
      void this.router.navigate(['/tabs/meals/foods']);
      return;
    }

    this.name = food.name;
    this.quantity = food.quantity;
    this.unit = food.unit;
    this.calories = food.calories;
    this.protein = food.macros.protein;
    this.carbs = food.macros.carbs;
    this.fat = food.macros.fat;
    this.sugar = food.macros.sugar;

    if (food.micronutrients) {
      this.micronutrients = { ...createEmptyMicronutrients(), ...food.micronutrients };
      this.micronutrientsOpen = true;
    }
  }

  get isEditMode(): boolean {
    return !!this.foodId;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar alimento' : 'Cadastrar alimento';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'Atualize os dados da sua biblioteca'
      : 'Adicione à sua biblioteca pessoal';
  }

  get saveLabel(): string {
    return this.isEditMode ? 'Salvar alterações' : 'Salvar alimento';
  }

  get availableUnits(): string[] {
    if (FOOD_UNITS.includes(this.unit as (typeof FOOD_UNITS)[number])) {
      return [...FOOD_UNITS];
    }

    return [...FOOD_UNITS, this.unit];
  }

  get referenceLabel(): string {
    return `Por ${this.quantity}${this.unit}`;
  }

  goBack(): void {
    this.location.back();
  }

  selectUnit(unit: string): void {
    this.unit = unit;
  }

  toggleMicronutrients(): void {
    this.micronutrientsOpen = !this.micronutrientsOpen;
  }

  private hasMicronutrients(): boolean {
    return Object.values(this.micronutrients).some((value) => value > 0);
  }

  private buildFoodPayload(): Omit<Food, 'id'> {
    const macros: MacroNutrients = {
      protein: this.protein,
      carbs: this.carbs,
      fat: this.fat,
      sugar: this.sugar,
    };

    return {
      name: this.name.trim(),
      quantity: this.quantity,
      unit: this.unit,
      calories: this.calories,
      macros,
      ...(this.hasMicronutrients() ? { micronutrients: { ...this.micronutrients } } : {}),
    };
  }

  async onSave(): Promise<void> {
    if (this.isSaving || !this.name.trim()) {
      return;
    }

    this.isSaving = true;

    try {
      const payload = this.buildFoodPayload();
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      const type = this.route.snapshot.queryParamMap.get('type');

      if (this.isEditMode && this.foodId) {
        await this.foodCatalog.updateFood(this.foodId, payload);
        await this.router.navigate(['/tabs/meals/foods']);
        return;
      }

      const food = await this.foodCatalog.addFood(payload);

      if (returnTo === 'add-meal') {
        await this.router.navigate(['/tabs/meals/add'], {
          queryParams: { selectFood: food.id, type },
        });
        return;
      }

      await this.router.navigate(['/tabs/meals/foods']);
    } finally {
      this.isSaving = false;
    }
  }
}
