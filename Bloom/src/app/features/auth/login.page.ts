import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  barChartOutline,
  cloudOutline,
  layersOutline,
  logoApple,
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
  logoApple,
  logoGoogle,
  sparklesOutline,
  trophyOutline,
});

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonIcon],
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly premiumFeatures = PREMIUM_FEATURES;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.authService.user()) {
        void this.router.navigate(['/dashboard']);
      }
    });
  }

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  useOffline(): void {
    void this.router.navigate(['/dashboard']);
  }

  async signInWithGoogle(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(this.authService.resolveAuthError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  signInWithApple(): void {
    // Próxima etapa
  }
}
