import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNavigate } from 'react-router-dom';
import { scheduleReminder, cancelReminder, snoozeReminder } from './scheduler';

/** Helper: always reads fresh state from the Zustand store. */
function getReminderFromStore(reminderId: string): Reminder | undefined {
  const storeHook = (window as any).remindersStore;
  return storeHook?.getState?.()?.reminders?.find(
    (r: Reminder) => r.id === reminderId
  );
}

/** Cancel all pending slots then schedule a fresh batch (prevents accumulation). */
async function requeue(reminder: Reminder): Promise<void> {
  await cancelReminder(reminder);
  await scheduleReminder(reminder);
}

export function useNotificationSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    // ── 1. Permissions ─────────────────────────────────────────────────────
    LocalNotifications.checkPermissions()
      .then((check) => {
        if (check.display !== 'granted') LocalNotifications.requestPermissions();
      })
      .catch(() => {});

    // ── 2. Channels (idempotent) ────────────────────────────────────────────
    LocalNotifications.createChannel({
      id: 'nyanudge_default', name: 'NyaNudge Reminders',
      importance: 4, sound: 'chime_soft', vibration: true, visibility: 1
    }).catch(() => {});

    LocalNotifications.createChannel({
      id: 'nyanudge_medication', name: 'Medication Reminders',
      importance: 5, sound: 'chime_persistent', vibration: true, visibility: 1
    }).catch(() => {});

    // ── 3. Action buttons ───────────────────────────────────────────────────
    LocalNotifications.registerActionTypes({
      types: [{
        id: 'NYANUDGE_REMINDER',
        actions: [
          { id: 'complete', title: 'Mark as Done', foreground: false },
          { id: 'snooze',   title: 'Snooze 10m',  foreground: false },
        ]
      }]
    }).catch(() => {});

    // ── 4. localNotificationReceived — app foregrounded ─────────────────────
    // Requeue interval batch after the current slot fires (keep chain alive).
    const receivedSub = LocalNotifications.addListener(
      'localNotificationReceived',
      (notification) => {
        const extra = notification.extra;
        if (!extra?.reminderId) return;

        const reminder = getReminderFromStore(extra.reminderId);
        if (reminder?.enabled && !reminder.archived) {
          const hasInterval = reminder.schedules.some((s: Schedule) => s.type === 'interval');
          if (hasInterval) {
            // 2-second buffer so tray notification isn't replaced immediately
            setTimeout(() => requeue(reminder), 2000);
          }
        }
      }
    );

    // ── 5. localNotificationActionPerformed — user taps tray ────────────────
    const actionSub = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notifAction) => {
        const extra    = notifAction.notification.extra;
        const actionId = notifAction.actionId;
        if (!extra?.reminderId) return;

        const storeHook = (window as any).remindersStore;
        const reminder  = getReminderFromStore(extra.reminderId);

        if (actionId === 'complete') {
          // ✅ Tray "Mark as Done" button — record completion silently
          storeHook?.getState?.()?.completeReminder?.(extra.reminderId);

        } else if (actionId === 'snooze') {
          // 💤 Tray "Snooze 10m" button — schedule +snoozeMins
          if (reminder) snoozeReminder(notifAction.notification.id, reminder);
          return; // snooze doesn't need requeue here; new slot is already scheduled

        } else {
          // 👆 Default body tap — open home screen with action modal
          const label = reminder
            ? reminder.label
            : (extra.category ?? 'Lembrete');

          storeHook?.getState?.()?.setPendingNotifAction?.({
            reminderId: extra.reminderId,
            label,
            category: extra.category ?? 'water',
          });

          navigate('/');
        }

        // After complete/tap, requeue interval chain
        if (reminder?.enabled && !reminder.archived) {
          const hasInterval = reminder.schedules.some((s: Schedule) => s.type === 'interval');
          if (hasInterval) {
            setTimeout(() => requeue(reminder), 1000);
          }
        }
      }
    );

    return () => {
      receivedSub.then(s => s.remove()).catch(() => {});
      actionSub.then(s => s.remove()).catch(() => {});
    };
  }, [navigate]);
}
