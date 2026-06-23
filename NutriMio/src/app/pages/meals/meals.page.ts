import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, bookmarkOutline, restaurantOutline } from 'ionicons/icons';
import { map, Observable } from 'rxjs';
import { MealCategorySlot } from '../../models';
import { NutritionService } from '../../services/nutrition.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { MealDayCardComponent } from '../../shared/components/meal-day-card/meal-day-card.component';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.page.html',
  styleUrls: ['./meals.page.scss'],
  imports: [AsyncPipe, IonContent, IonIcon, IonToast, MealDayCardComponent, EmptyStateComponent],
})
export class MealsPage {
  private readonly router = inject(Router);
  private readonly nutritionService = inject(NutritionService);

  readonly mealSlots$: Observable<MealCategorySlot[]> = this.nutritionService.todayMealSlots$;
  readonly hasMealsToday$: Observable<boolean> = this.mealSlots$.pipe(
    map((slots) => slots.some((slot) => slot.meal !== null)),
  );
  showTemplatesToast = false;

  constructor() {
    addIcons({ addOutline, bookmarkOutline, restaurantOutline });
  }

  onAddMeal(): void {
    void this.router.navigate(['/tabs/meals/add']);
  }

  onOpenTemplates(): void {
    this.showTemplatesToast = true;
  }

  onEditMeal(type: string): void {
    void this.router.navigate(['/tabs/meals/add'], { queryParams: { type } });
  }
}
