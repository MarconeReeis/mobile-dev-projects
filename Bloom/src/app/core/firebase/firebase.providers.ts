import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { FirebaseOptions } from 'firebase/app';

export interface FirebaseEnvironment {
  production: boolean;
  firebase: FirebaseOptions;
}

export function provideBloomFirebase(config: FirebaseEnvironment): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideFirebaseApp(() => initializeApp(config.firebase)),
    provideAuth(() => getAuth()),
    ...(config.production ? [provideAnalytics(() => getAnalytics())] : []),
  ]);
}
