import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quoryn.nyanudge.app',
  appName: 'NyaNudge',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      iconColor: '#E97B22',
      channels: [
        {
          id: 'nyanudge_default',
          name: 'NyaNudge Reminders',
          importance: 4,        // HIGH
          visibility: 1,        // PUBLIC
          sound: 'chime_soft',  // default
          vibration: true,
          lights: true,
          lightColor: '#E97B22'
        },
        {
          id: 'nyanudge_medication',
          name: 'Medication Reminders',
          importance: 5,        // MAX (heads-up)
          visibility: 1,
          sound: 'chime_persistent',
          vibration: true,
          lights: true,
          lightColor: '#D65B5B'
        },
        {
          id: 'nyanudge_silent',
          name: 'NyaNudge Silent',
          importance: 2,        // LOW — no sound, no pop
          vibration: false
        }
      ]
    }
  }
};

export default config;
