import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

addIcons({ logInOutline, logOutOutline });

@Component({
  selector: 'app-auth-menu',
  templateUrl: './auth-menu.component.html',
  styleUrls: ['./auth-menu.component.scss'],
  imports: [IonIcon, RouterLink],
})
export class AuthMenuComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly isMenuOpen = signal(false);
  readonly isSigningOut = signal(false);

  readonly displayName = computed(() => this.user()?.displayName?.trim() || 'Usuário');
  readonly email = computed(() => this.user()?.email ?? '');
  readonly photoUrl = computed(() => this.user()?.photoURL ?? null);
  readonly initials = computed(() => {
    const parts = this.displayName().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return 'U';
    }

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  });

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  async signOut(): Promise<void> {
    if (this.isSigningOut()) {
      return;
    }

    this.isSigningOut.set(true);

    try {
      this.closeMenu();
      await this.authService.signOutUser();
    } finally {
      this.isSigningOut.set(false);
    }
  }
}
