import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationService } from './core/services/push-notification.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly pushNotifications = inject(PushNotificationService);

  constructor() {
    this.themeService.init();
    void this.pushNotifications.init();
  }
}
