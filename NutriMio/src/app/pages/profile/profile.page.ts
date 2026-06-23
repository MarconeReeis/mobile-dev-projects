import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonToast,
  IonToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  flameOutline,
  flagOutline,
  moonOutline,
  notificationsOutline,
  resizeOutline,
} from 'ionicons/icons';
import { UserProfile } from '../../models';
import { NutritionService } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonContent, IonIcon, IonToggle, IonToast],
})
export class ProfilePage implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly nutritionService = inject(NutritionService);

  user: UserProfile = this.userService.getUser();
  streakDays = 0;
  totalMeals = 0;
  showLogoutToast = false;

  constructor() {
    addIcons({
      flameOutline,
      bookOutline,
      flagOutline,
      moonOutline,
      notificationsOutline,
      resizeOutline,
    });
  }

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });

    this.refreshStats();
  }

  ionViewWillEnter(): void {
    this.refreshStats();
  }

  private refreshStats(): void {
    this.streakDays = this.nutritionService.getCurrentStreak();
    this.totalMeals = this.nutritionService.getTotalMealsLogged();
  }

  get premiumLabel(): string {
    if (this.user.isPremium && this.user.premiumSince) {
      return `Premium · desde ${this.user.premiumSince}`;
    }
    return 'Uso pessoal';
  }

  onEditGoals(): void {
    void this.router.navigate(['/tabs/profile/goals']);
  }

  async onDarkThemeChange(checked: boolean): Promise<void> {
    await this.userService.updateSettings({ darkTheme: checked });
  }

  async onNotificationsChange(checked: boolean): Promise<void> {
    await this.userService.updateSettings({ notifications: checked });
  }

  async onMetricUnitsChange(checked: boolean): Promise<void> {
    await this.userService.updateSettings({ metricUnits: checked });
  }

  onLogout(): void {
    this.showLogoutToast = true;
  }
}
