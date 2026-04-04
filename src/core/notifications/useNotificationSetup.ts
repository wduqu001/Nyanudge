import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNavigate } from 'react-router-dom';

export function useNotificationSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    // Request permissions on setup
    const requestPermissions = async () => {
      try {
        const check = await LocalNotifications.checkPermissions();
        if (check.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (err) {
        console.log('LocalNotifications not available (probably web)', err);
      }
    };

    requestPermissions();

    // Listeners handles clicks on the notification
    const listener = LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      const extra = notificationAction.notification.extra;
      if (extra && extra.reminderId) {
        // Navigate to the reminder edit screen when clicked
        navigate(`/reminder/${extra.reminderId}`);
      }
    });

    return () => {
      listener.then(sub => sub.remove()).catch(() => {});
    };
  }, [navigate]);
}
