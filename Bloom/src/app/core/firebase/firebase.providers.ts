import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { FirebaseOptions } from 'firebase/app';

export interface FirebaseEnvironment {
  production: boolean;
  firebase: FirebaseOptions;
}

/**
 * Providers mínimos do Firebase para o plano gratuito.
 * Auth e Firestore entram na fase premium (sync na nuvem).
 */
export function provideBloomFirebase(config: FirebaseEnvironment): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideFirebaseApp(() => initializeApp(config.firebase)),
    ...(config.production ? [provideAnalytics(() => getAnalytics())] : []),
  ]);
}
