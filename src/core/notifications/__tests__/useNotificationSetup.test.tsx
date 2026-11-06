import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNotificationSetup } from '../useNotificationSetup';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useRemindersStore } from '../../store/remindersStore';
import { snoozeReminder } from '../scheduler';

const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));
vi.mock('../scheduler', () => ({
  snoozeReminder: vi.fn(), ensureNotificationChannels: vi.fn(),
}));
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn(),
    registerActionTypes: vi.fn().mockResolvedValue(undefined),
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
  },
}));

function performAction(actionId: string, extra: Record<string, unknown> = { reminderId: 'r1', category: 'water' }) {
  const call = vi.mocked(LocalNotifications.addListener).mock.calls.find(([event]) => event === 'localNotificationActionPerformed');
  const listener = call?.[1] as (action: unknown) => void;
  listener({ actionId, notification: { id: 1, extra } });
}
const tapNotification = () => performAction('tap');

describe('useNotificationSetup — notification body tap', () => {
  const completeReminder = vi.fn();
  const setPendingNotifAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { remindersStore: unknown }).remindersStore = {
      getState: () => ({ reminders: [], completeReminder, setPendingNotifAction }),
    };
    useRemindersStore.setState({ reminders: [] });
  });

  it('opens the action sheet when mark-as-done-on-open is off', () => {
    usePreferencesStore.setState((s) => ({ preferences: { ...s.preferences, markAsDoneOnOpen: false } }));
    renderHook(() => useNotificationSetup());
    tapNotification();
    expect(setPendingNotifAction).toHaveBeenCalled();
    expect(completeReminder).not.toHaveBeenCalled();
  });

  it('completes the reminder directly when mark-as-done-on-open is on', () => {
    usePreferencesStore.setState((s) => ({ preferences: { ...s.preferences, markAsDoneOnOpen: true } }));
    renderHook(() => useNotificationSetup());
    tapNotification();
    expect(completeReminder).toHaveBeenCalledWith('r1');
    expect(setPendingNotifAction).not.toHaveBeenCalled();
  });
});

describe('useNotificationSetup — first-run permission', () => {
  it('plans reminders as soon as the user allows notifications', async () => {
    const syncNotifications = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { remindersStore: unknown }).remindersStore = { getState: () => ({ syncNotifications }) };
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValueOnce({ display: 'prompt' });
    (LocalNotifications as unknown as { requestPermissions: ReturnType<typeof vi.fn> }).requestPermissions.mockResolvedValueOnce({ display: 'granted' });
    renderHook(() => useNotificationSetup());
    await vi.waitFor(() => expect(syncNotifications).toHaveBeenCalledOnce());
  });
});

describe('useNotificationSetup — tray actions', () => {
  const reminder = { id: 'r1', category: 'water', label: 'Water', snoozeMins: 10 } as Reminder;
  const completeReminder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { remindersStore: unknown }).remindersStore = {
      getState: () => ({ reminders: [reminder], completeReminder, setPendingNotifAction: vi.fn() }),
    };
  });

  it('marks the reminder done from the Done action', () => {
    renderHook(() => useNotificationSetup());
    performAction('complete');
    expect(completeReminder).toHaveBeenCalledWith('r1');
  });

  it('snoozes the reminder from the Snooze action', () => {
    vi.mocked(snoozeReminder).mockResolvedValue(undefined);
    renderHook(() => useNotificationSetup());
    performAction('snooze');
    expect(snoozeReminder).toHaveBeenCalledWith(reminder);
  });

  it('ignores notifications that are not reminders', () => {
    renderHook(() => useNotificationSetup());
    performAction('complete', {});
    expect(completeReminder).not.toHaveBeenCalled();
  });

  it('does not plan reminders when the user denies notifications', async () => {
    const syncNotifications = vi.fn();
    (window as unknown as { remindersStore: unknown }).remindersStore = { getState: () => ({ syncNotifications }) };
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValueOnce({ display: 'prompt' });
    (LocalNotifications as unknown as { requestPermissions: ReturnType<typeof vi.fn> }).requestPermissions.mockResolvedValueOnce({ display: 'denied' });
    renderHook(() => useNotificationSetup());
    await vi.waitFor(() => expect(LocalNotifications.requestPermissions).toHaveBeenCalled());
    expect(syncNotifications).not.toHaveBeenCalled();
  });
});
