import { Component, inject, signal } from '@angular/core';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudDoneOutline, logoGoogle } from 'ionicons/icons';
import { AppInitService } from '../../services/app-init.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonIcon],
})
export class LoginPage {
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);
  private readonly appInit = inject(AppInitService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    addIcons({ cloudDoneOutline, logoGoogle });
  }

  async signInWithGoogle(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.signInWithGoogle();
      await this.appInit.startSession(user);
      await this.navCtrl.navigateRoot('/tabs/dashboard');
    } catch (error) {
      console.error('[Login] Falha no login', error);
      this.errorMessage.set(this.authService.resolveAuthError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  continueWithoutAccount(): void {
    void this.navCtrl.navigateBack('/tabs/dashboard');
  }
}
