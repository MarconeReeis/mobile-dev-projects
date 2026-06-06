import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  Auth,
  signInWithCredential,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { getAuthErrorMessage } from '../utils/auth-error.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  readonly user = toSignal(user(this.auth), { initialValue: null });
  readonly isAuthenticated = () => this.user() !== null;

  async signInWithGoogle(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.signInWithGoogleNative();
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(this.auth, provider);
  }

  async signOutUser(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }

    await signOut(this.auth);
  }

  resolveAuthError(error: unknown): string {
    return getAuthErrorMessage(error);
  }

  private async signInWithGoogleNative(): Promise<void> {
    const result = await FirebaseAuthentication.signInWithGoogle({
      skipNativeAuth: true,
    });

    const idToken = result.credential?.idToken;
    const accessToken = result.credential?.accessToken;

    if (!idToken) {
      throw new Error('Não foi possível obter credenciais do Google.');
    }

    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    await signInWithCredential(this.auth, credential);
  }
}
