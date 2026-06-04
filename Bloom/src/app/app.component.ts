import { afterNextRender, Component, inject, signal } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FEATURE_FLAGS } from './core/constants/feature-flags';
import { PushNotificationService } from './core/services/push-notification.service';
import { SplashScreenService } from './core/services/splash-screen.service';
import { ThemeService } from './core/services/theme.service';
import { AppSplashOverlayComponent } from './shared/components/app-splash-overlay/app-splash-overlay.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AppSplashOverlayComponent],
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly pushNotifications = inject(PushNotificationService);
  private readonly splashScreen = inject(SplashScreenService);

  readonly splashVisible = signal(true);
  readonly splashExiting = signal(false);

  constructor() {
    this.themeService.init();

    if (FEATURE_FLAGS.pushNotifications) {
      void this.pushNotifications.init();
    }

    afterNextRender(() => {
      void this.runSplashSequence();
    });
  }

  private async runSplashSequence(): Promise<void> {
    await this.splashScreen.hideNativeSplash();
    await this.splashScreen.waitForDuration();
    this.splashExiting.set(true);
    await this.splashScreen.waitForExitAnimation();
    this.splashVisible.set(false);
  }
}
