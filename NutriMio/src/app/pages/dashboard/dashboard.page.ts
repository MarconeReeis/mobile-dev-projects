import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, notificationsOutline, restaurantOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { formatHeaderDate } from '../../core/utils/date.utils';
import { DailySummary, UserProfile } from '../../models';
import { NutritionService } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CircularProgressComponent } from '../../shared/components/circular-progress/circular-progress.component';
import { MacroCardComponent } from '../../shared/components/macro-card/macro-card.component';
import { MealItemComponent } from '../../shared/components/meal-item/meal-item.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    AsyncPipe,
    DecimalPipe,
    IonContent,
    IonButton,
    IonIcon,
    CircularProgressComponent,
    MacroCardComponent,
    MealItemComponent,
    EmptyStateComponent,
  ],
})
export class DashboardPage implements OnInit {
  private readonly nutritionService = inject(NutritionService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly headerDate = formatHeaderDate();
  readonly summary$: Observable<DailySummary | null> = this.nutritionService.dailySummary$;
  user: UserProfile = this.userService.getUser();

  constructor() {
    addIcons({ notificationsOutline, addOutline, restaurantOutline });
  }

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  onAddMeal(): void {
    void this.router.navigate(['/tabs/meals/add']);
  }

  onViewAllMeals(): void {
    void this.router.navigate(['/tabs/meals']);
  }
}
