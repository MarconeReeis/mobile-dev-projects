import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'quittrack.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>(this.resolveInitialTheme());

  toggle(): void {
    const next: AppTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  apply(theme: AppTheme): void {
    this.theme.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    void this.syncStatusBar(theme);
  }

  init(): void {
    this.apply(this.theme());
  }

  private async syncStatusBar(theme: AppTheme): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
  }

  private resolveInitialTheme(): AppTheme {
    const stored = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
