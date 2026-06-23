import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, nutritionOutline, trashOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Food } from '../../models';
import { FoodCatalogService } from '../../services/food-catalog.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.page.html',
  styleUrls: ['./foods.page.scss'],
  imports: [AsyncPipe, IonContent, IonButton, IonIcon, EmptyStateComponent],
})
export class FoodsPage {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly foodCatalog = inject(FoodCatalogService);

  readonly foods$: Observable<Food[]> = this.foodCatalog.foods$;

  constructor() {
    addIcons({ arrowBackOutline, addOutline, trashOutline, nutritionOutline });
  }

  goBack(): void {
    this.location.back();
  }

  onAddFood(): void {
    void this.router.navigate(['/tabs/meals/foods/add']);
  }

  async onDeleteFood(foodId: string): Promise<void> {
    await this.foodCatalog.deleteFood(foodId);
  }
}
