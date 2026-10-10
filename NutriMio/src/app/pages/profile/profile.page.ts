import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonIcon,
  IonToggle,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  discOutline,
  flameOutline,
  logOutOutline,
  moonOutline,
  notificationsOutline,
  resizeOutline,
} from 'ionicons/icons';
import { UserProfile } from '../../models';
import { AppInitService } from '../../services/app-init.service';
import { AuthService } from '../../services/auth.service';
import { NutritionService } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonContent, IonIcon, IonToggle],
})
export class ProfilePage implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly nutritionService = inject(NutritionService);
  private readonly appInit = inject(AppInitService);
  private readonly alertCtrl = inject(AlertController);
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);

  user: UserProfile = this.userService.getUser();
  streakDays = 0;
  totalMeals = 0;
  photoUrl: string | null = null;
  photoFailed = false;
  accountLabel = '';

  constructor() {
    addIcons({
      flameOutline,
      bookOutline,
      discOutline,
      logOutOutline,
      moonOutline,
      notificationsOutline,
      resizeOutline,
    });
  }

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });

    this.refreshAccount();
    this.refreshStats();
  }

  ionViewWillEnter(): void {
    this.refreshStats();
  }

  private refreshStats(): void {
    this.streakDays = this.nutritionService.getCurrentStreak();
    this.totalMeals = this.nutritionService.getTotalMealsLogged();
  }

  private refreshAccount(): void {
    const account = this.authService.getCurrentUser();
    this.photoUrl = account?.photoURL ?? null;
    this.photoFailed = false;

    const createdAt = account?.metadata.creationTime;
    this.accountLabel = createdAt
      ? `Conta Google · desde ${new Date(createdAt).toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric',
        })}`
      : 'Conta Google';
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

  async onLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Sair da conta',
      message: 'Seus dados continuam salvos na nuvem. Deseja sair?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sair', role: 'destructive', handler: () => void this.logout() },
      ],
    });
    await alert.present();
  }

  private async logout(): Promise<void> {
    await this.appInit.endSession();
    await this.navCtrl.navigateRoot('/login');
  }
}
