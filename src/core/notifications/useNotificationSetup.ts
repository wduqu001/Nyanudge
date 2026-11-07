import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { snoozeReminder, ensureNotificationChannels } from './scheduler';
import { usePreferencesStore } from '../store/preferencesStore';

type RemindersStoreWindow = typeof window & {
  remindersStore?: {
    getState?: () => {
      reminders?: Reminder[];
      completeReminder?: (id: string) => void;
      setPendingNotifAction?: (action: { reminderId: string; label: string; category: string } | null) => void;
      syncNotifications?: () => Promise<void>;
      snooze?: (id: string) => Promise<void>;
    };
  };
};

/** Helper: always reads fresh state from the Zustand store. */
function getReminderFromStore(reminderId: string): Reminder | undefined {
  const storeHook = (window as RemindersStoreWindow).remindersStore;
  return storeHook?.getState?.()?.reminders?.find(
    (r: Reminder) => r.id === reminderId
  );
}

export function useNotificationSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    // ── 1. Permissions ─────────────────────────────────────────────────────
    // The plugin rejects schedule() until notifications are allowed, so plan reminders after the answer.
    LocalNotifications.checkPermissions()
      .then(async (check) => {
        if (check.display === 'granted') return;
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') {
          await (window as RemindersStoreWindow).remindersStore?.getState?.()?.syncNotifications?.();
        }
      })
      .catch(() => {});

    // ── 2. Channels (idempotent) ────────────────────────────────────────────
    ensureNotificationChannels();

    // ── 3. Action buttons ───────────────────────────────────────────────────
    LocalNotifications.registerActionTypes({
      types: [{
        id: 'NYANUDGE_REMINDER',
        actions: [
          { id: 'complete', title: i18n.t('actions.done'), foreground: false },
          { id: 'snooze', title: i18n.t('actions.snooze'), foreground: false },
        ]
      }]
    }).catch(() => {});

    // ── 4. localNotificationActionPerformed — user taps tray ────────────────
    const actionSub = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notifAction) => {
        const extra    = notifAction.notification.extra;
        const actionId = notifAction.actionId;
        if (!extra?.reminderId) return;

        const storeHook = (window as RemindersStoreWindow).remindersStore;
        const reminder  = getReminderFromStore(extra.reminderId);

        if (actionId === 'complete') {
          storeHook?.getState?.()?.completeReminder?.(extra.reminderId);

        } else if (actionId === 'snooze') {
          if (reminder) {
            const snooze = storeHook?.getState?.()?.snooze;
            (snooze ? snooze(reminder.id) : snoozeReminder(reminder)).catch(() => {});
          }

        } else if (usePreferencesStore.getState().preferences.markAsDoneOnOpen) {
          storeHook?.getState?.()?.completeReminder?.(extra.reminderId);
          navigate('/');

        } else {
          // Default body tap — open home screen with action modal
          const label = reminder
            ? reminder.label
            : (extra.category ?? '');

          storeHook?.getState?.()?.setPendingNotifAction?.({
            reminderId: extra.reminderId,
            label,
            category: extra.category ?? 'water',
          });

          navigate('/');
        }
      }
    );

    return () => {
      actionSub.then(s => s.remove()).catch(() => {});
    };
  }, [navigate]);
}
