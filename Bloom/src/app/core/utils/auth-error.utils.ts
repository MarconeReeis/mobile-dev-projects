import { FirebaseError } from 'firebase/app';

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Login cancelado.';
      case 'auth/network-request-failed':
        return 'Verifique sua conexão e tente novamente.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este e-mail usando outro método de login.';
      default:
        return 'Não foi possível entrar. Tente novamente.';
    }
  }

  if (error instanceof Error) {
    if (/cancel/i.test(error.message)) {
      return 'Login cancelado.';
    }

    if (error.message.includes('credenciais')) {
      return error.message;
    }
  }

  return 'Não foi possível entrar. Tente novamente.';
}
