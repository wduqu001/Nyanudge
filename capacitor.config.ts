import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quoryn.nyanudge.app',
  appName: 'NyaNudge',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      iconColor: '#E97B22'
    }
  }
};

export default config;
