import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, saveOutline } from 'ionicons/icons';
import { MacroNutrients } from '../../models';
import { FoodCatalogService } from '../../services/food-catalog.service';

const FOOD_UNITS = ['g', 'ml', 'un', 'fatias', 'colher', 'porção'] as const;

@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.page.html',
  styleUrls: ['./add-food.page.scss'],
  imports: [
    FormsModule,
    IonContent,
    IonInput,
    IonIcon,
    IonSelect,
    IonSelectOption,
  ],
})
export class AddFoodPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly foodCatalog = inject(FoodCatalogService);

  readonly units = FOOD_UNITS;

  name = '';
  quantity = 100;
  unit: (typeof FOOD_UNITS)[number] = 'g';
  calories = 0;
  protein = 0;
  carbs = 0;
  fat = 0;
  sugar = 0;
  isSaving = false;

  constructor() {
    addIcons({ arrowBackOutline, saveOutline });
  }

  goBack(): void {
    this.location.back();
  }

  async onSave(): Promise<void> {
    if (this.isSaving || !this.name.trim()) {
      return;
    }

    this.isSaving = true;

    const macros: MacroNutrients = {
      protein: this.protein,
      carbs: this.carbs,
      fat: this.fat,
      sugar: this.sugar,
    };

    try {
      const food = await this.foodCatalog.addFood({
        name: this.name.trim(),
        quantity: this.quantity,
        unit: this.unit,
        calories: this.calories,
        macros,
      });

      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      const type = this.route.snapshot.queryParamMap.get('type');

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
