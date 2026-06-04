import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.bloomi.app',
  appName: 'Bloomi',
  webDir: 'www',
  loggingBehavior: 'debug',
  ios: {
    loggingBehavior: 'debug',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: '#f7faf9',
    },
  },
};

export default config;
