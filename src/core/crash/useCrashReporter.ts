/**
 * useCrashReporter
 *
 * Manages the local crash log system. Provides:
 * - Opt-in/out toggle (persisted to localStorage)
 * - Reading crash logs written by ErrorBoundary
 * - Clearing all saved logs
 * - Exporting logs as a downloadable JSON file
 */

export const CRASH_LOGS_KEY = 'nyanudge_crash_logs';
export const CRASH_OPT_IN_KEY = 'nyanudge_crash_reporter_enabled';

export interface CrashLog {
  timestamp: string;
  error: string;
  stack?: string;
  componentStack?: string | null;
}

export function isCrashReporterEnabled(): boolean {
  return localStorage.getItem(CRASH_OPT_IN_KEY) === 'true';
}

export function setCrashReporterEnabled(enabled: boolean): void {
  localStorage.setItem(CRASH_OPT_IN_KEY, enabled ? 'true' : 'false');
}

export function getCrashLogs(): CrashLog[] {
  try {
    return JSON.parse(localStorage.getItem(CRASH_LOGS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function appendCrashLog(entry: Omit<CrashLog, never>): void {
  if (!isCrashReporterEnabled()) return;
  try {
    const logs = getCrashLogs();
    logs.unshift(entry);
    localStorage.setItem(CRASH_LOGS_KEY, JSON.stringify(logs.slice(0, 10)));
  } catch (e) {
    console.error('[CrashReporter] Failed to persist crash log', e);
  }
}

export function clearCrashLogs(): void {
  localStorage.removeItem(CRASH_LOGS_KEY);
}

export function exportCrashLogs(): void {
  const logs = getCrashLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nyanudge-crash-logs-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
