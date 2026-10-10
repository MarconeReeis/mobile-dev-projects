import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { firebaseAuth } from '../core/firebase/firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(firebaseAuth.currentUser);
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(firebaseAuth, (user) => this.userSubject.next(user));
  }

  /** Aguarda o Firebase restaurar a sessão salva antes de decidir a rota inicial. */
  async waitForAuthReady(): Promise<User | null> {
    await firebaseAuth.authStateReady();
    return firebaseAuth.currentUser;
  }

  getCurrentUser(): User | null {
    return firebaseAuth.currentUser;
  }

  requireUid(): string {
    const uid = firebaseAuth.currentUser?.uid;

    if (!uid) {
      throw new Error('Usuário não autenticado.');
    }

    return uid;
  }

  async signInWithGoogle(): Promise<User> {
    if (Capacitor.isNativePlatform()) {
      return this.signInWithGoogleNative();
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user;
  }

  async signOutUser(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }

    await signOut(firebaseAuth);
  }

  resolveAuthError(error: unknown): string {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          return 'Login cancelado.';
        case 'auth/network-request-failed':
          return 'Verifique sua conexão e tente novamente.';
        default:
          return 'Não foi possível entrar. Tente novamente.';
      }
    }

    if (error instanceof Error && /cancel/i.test(error.message)) {
      return 'Login cancelado.';
    }

    return 'Não foi possível entrar. Tente novamente.';
  }

  private async signInWithGoogleNative(): Promise<User> {
    const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
    const idToken = result.credential?.idToken;

    if (!idToken) {
      throw new Error('Não foi possível obter credenciais do Google.');
    }

    const credential = GoogleAuthProvider.credential(idToken, result.credential?.accessToken);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    return userCredential.user;
  }
}
