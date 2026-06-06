import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { Auth, getAuth, initializeAuth, provideAuth } from '@angular/fire/auth';
import { FirebaseOptions } from 'firebase/app';
import { indexedDBLocalPersistence } from 'firebase/auth';

export interface FirebaseEnvironment {
  production: boolean;
  firebase: FirebaseOptions;
}

function createFirebaseAuth(): Auth {
  const app = getApp();

  if (Capacitor.isNativePlatform()) {
    try {
      return initializeAuth(app, { persistence: indexedDBLocalPersistence });
    } catch {
      return getAuth(app);
    }
  }

  return getAuth(app);
}

export function provideBloomFirebase(config: FirebaseEnvironment): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideFirebaseApp(() => initializeApp(config.firebase)),
    provideAuth(() => createFirebaseAuth()),
    ...(config.production ? [provideAnalytics(() => getAnalytics())] : []),
  ]);
}
