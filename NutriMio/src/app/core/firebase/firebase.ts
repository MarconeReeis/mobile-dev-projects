import { Capacitor } from '@capacitor/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import {
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

export const firebaseApp: FirebaseApp = initializeApp(environment.firebase);

/**
 * No WKWebView do iOS o persistence padrão (popup/iframe) não funciona,
 * por isso o Auth é inicializado só com IndexedDB no nativo.
 */
export const firebaseAuth: Auth = Capacitor.isNativePlatform()
  ? initializeAuth(firebaseApp, { persistence: indexedDBLocalPersistence })
  : getAuth(firebaseApp);

/**
 * Cache local persistente: o app continua funcionando offline e as escritas
 * pendentes são sincronizadas com o servidor quando a conexão voltar.
 */
export const firestore: Firestore = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) }),
  // No WKWebView a conexão padrão do Firestore fica tentando abrir um canal
  // que o iOS não entrega. Essa tentativa leva cerca de 1 a 2 minutos e só
  // depois o SDK muda de estratégia. No iPhone usamos long-polling desde o início.
  ...(Capacitor.getPlatform() === 'ios' ? { experimentalForceLongPolling: true } : {}),
});
