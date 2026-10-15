import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/** A tela de login só faz sentido para quem ainda não entrou. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.waitForAuthReady();
  return user ? router.parseUrl('/tabs/profile') : true;
};
