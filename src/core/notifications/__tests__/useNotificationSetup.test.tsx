import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNotificationSetup } from '../useNotificationSetup';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useRemindersStore } from '../../store/remindersStore';

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

function tapNotification() {
  const call = vi.mocked(LocalNotifications.addListener).mock.calls.find(([event]) => event === 'localNotificationActionPerformed');
  const listener = call?.[1] as (action: unknown) => void;
  listener({ actionId: 'tap', notification: { id: 1, extra: { reminderId: 'r1', category: 'water' } } });
}

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
