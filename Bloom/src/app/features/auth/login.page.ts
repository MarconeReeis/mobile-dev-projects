import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  barChartOutline,
  cloudOutline,
  layersOutline,
  logoGoogle,
  sparklesOutline,
  trophyOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

const PREMIUM_FEATURES = [
  { icon: 'bar-chart-outline', label: 'Estatísticas avançadas' },
  { icon: 'layers-outline', label: 'Widgets personalizados' },
  { icon: 'cloud-outline', label: 'Backup ilimitado' },
  { icon: 'trophy-outline', label: 'Conquistas exclusivas' },
  { icon: 'sparkles-outline', label: 'Insights inteligentes' },
] as const;

addIcons({
  arrowBackOutline,
  barChartOutline,
  cloudOutline,
  layersOutline,
  logoGoogle,
  sparklesOutline,
  trophyOutline,
});

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class LoginPage {
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);

  readonly premiumFeatures = PREMIUM_FEATURES;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.authService.user()) {
        void this.navCtrl.navigateRoot('/dashboard');
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signInWithGoogle();
      await this.navCtrl.navigateRoot('/dashboard');
    } catch (error) {
      this.errorMessage.set(this.authService.resolveAuthError(error));
    } finally {
      this.isLoading.set(false);
    }
  }
}
