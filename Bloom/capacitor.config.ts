import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.bloomi.app',
  appName: 'Bloomi - Controle de vícios e hábitos',
  webDir: 'www',
  loggingBehavior: 'debug',
  ios: {
    loggingBehavior: 'debug',
  },
};

export default config;
