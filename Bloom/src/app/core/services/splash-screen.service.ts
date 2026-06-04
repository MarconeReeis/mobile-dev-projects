import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

/** Tempo com a splash in-app visível antes do fade-out. */
export const SPLASH_DURATION_MS = 2000;

/** Duração do fade-out para revelar a tela principal. */
export const SPLASH_EXIT_MS = 500;

@Injectable({ providedIn: 'root' })
export class SplashScreenService {
  /** Remove a splash nativa assim que a tela Angular estiver visível. */
  async hideNativeSplash(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await SplashScreen.hide();
  }

  /** Mantém a splash in-app visível pelo tempo definido. */
  async waitForDuration(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION_MS));
  }

  async waitForExitAnimation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, SPLASH_EXIT_MS));
  }
}
