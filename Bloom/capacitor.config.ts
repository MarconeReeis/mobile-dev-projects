import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.bloomi.app',
  appName: 'Bloomi',
  webDir: 'www',
  loggingBehavior: 'debug',
  ios: {
    loggingBehavior: 'debug',
  },
  experimental: {
    ios: {
      spm: {
        packageOptions: {
          '@capacitor-firebase/authentication': {
            symlink: true,
          },
        },
      },
    },
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: '#f7faf9',
    },
    FirebaseAuthentication: {
      providers: ['google.com'],
    },
  },
};

export default config;
