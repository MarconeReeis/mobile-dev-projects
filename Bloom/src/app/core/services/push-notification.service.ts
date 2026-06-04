import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly storage = inject(StorageService);

  private readonly tokenState = signal<string | null>(
    this.storage.get<string>(STORAGE_KEYS.pushToken),
  );

  /** Token FCM/APNs do dispositivo (null em web ou sem permissão). */
  readonly token = this.tokenState.asReadonly();

  /** Inicializa push apenas em plataformas nativas (Android/iOS). */
  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await this.attachListeners();
    await this.registerIfPermitted();
  }

  /** Solicita permissão e registra o dispositivo para receber push. */
  async requestPermissionAndRegister(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      return false;
    }

    await PushNotifications.register();
    this.storage.set(STORAGE_KEYS.pushEnabled, true);
    return true;
  }

  private async registerIfPermitted(): Promise<void> {
    const permission = await PushNotifications.checkPermissions();

    if (permission.receive === 'granted') {
      await PushNotifications.register();
      return;
    }

    if (permission.receive === 'prompt') {
      await this.requestPermissionAndRegister();
    }
  }

  private async attachListeners(): Promise<void> {
    await PushNotifications.addListener('registration', (event: Token) => {
      this.persistToken(event.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('[PushNotificationService] registration error', error);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.info('[PushNotificationService] received in foreground', notification);
      },
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.info('[PushNotificationService] action performed', action);
      },
    );
  }

  private persistToken(token: string): void {
    this.tokenState.set(token);
    this.storage.set(STORAGE_KEYS.pushToken, token);
  }
}
