import { describe, it, expect, vi } from 'vitest';
import { MigrationRunner } from '../MigrationRunner';

// ── Minimal SQLite connection fake ────────────────────────────────────────────
function makeDb(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    execute: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ values: [] }),
    ...overrides,
  };
}

// ── migrations stub (controls how many pending migrations exist) ──────────────
vi.mock('../migrations', () => ({
  migrations: [
    { version: 1, description: 'create reminders table', up: 'CREATE TABLE reminders (id TEXT);' },
    { version: 2, description: 'add archived column', up: 'ALTER TABLE reminders ADD COLUMN archived INTEGER;' },
  ],
}));

describe('MigrationRunner', () => {
  describe('runMigrations', () => {
    it('creates the preferences table on every call', async () => {
      const db = makeDb();
      await MigrationRunner.runMigrations(db as any);
      const [firstCall] = db.execute.mock.calls;
      expect(firstCall?.[0]).toContain('CREATE TABLE IF NOT EXISTS preferences');
    });

    it('applies all migrations when DB version is 0 (fresh DB)', async () => {
      const db = makeDb({
        query: vi.fn().mockResolvedValue({ values: [] }), // version = 0 (no row)
      });
      await MigrationRunner.runMigrations(db as any);
      // One db.execute per migration up statement (plus table creation = 3 total executes)
      const migrationExecutes = db.execute.mock.calls.filter(
        (call: any[]) => typeof call[0] === 'string' && !call[0].includes('CREATE TABLE IF NOT EXISTS preferences'),
      );
      expect(migrationExecutes).toHaveLength(2);
    });

    it('skips migrations that are already applied', async () => {
      const db = makeDb({
        // DB is already at version 2
        query: vi.fn().mockResolvedValue({ values: [{ value: '2' }] }),
      });
      await MigrationRunner.runMigrations(db as any);
      const migrationExecutes = db.execute.mock.calls.filter(
        (call: any[]) => typeof call[0] === 'string' && !call[0].includes('CREATE TABLE IF NOT EXISTS preferences'),
      );
      expect(migrationExecutes).toHaveLength(0);
    });

    it('applies only unapplied migrations when DB is at version 1', async () => {
      const db = makeDb({
        query: vi.fn().mockResolvedValue({ values: [{ value: '1' }] }),
      });
      await MigrationRunner.runMigrations(db as any);
      const migrationExecutes = db.execute.mock.calls.filter(
        (call: any[]) => typeof call[0] === 'string' && !call[0].includes('CREATE TABLE IF NOT EXISTS preferences'),
      );
      expect(migrationExecutes).toHaveLength(1); // only version 2
      expect(migrationExecutes[0]?.[0]).toContain('ALTER TABLE');
    });

    it('updates the version in preferences after each migration', async () => {
      const db = makeDb({ query: vi.fn().mockResolvedValue({ values: [] }) });
      await MigrationRunner.runMigrations(db as any);
      // db.run is called once per migration to upsert the version
      expect(db.run).toHaveBeenCalledTimes(2);
      // The last run should record version 2
      const lastRunArgs = db.run.mock.calls.at(-1) as [string, unknown[]];
      expect(lastRunArgs[1]).toContain('2');
    });

    it('throws and propagates an error if a migration fails', async () => {
      const db = makeDb({
        query: vi.fn().mockResolvedValue({ values: [] }),
        execute: vi.fn()
          .mockResolvedValueOnce(undefined) // preferences table creation OK
          .mockRejectedValueOnce(new Error('syntax error')), // migration 1 fails
      });
      await expect(MigrationRunner.runMigrations(db as any)).rejects.toThrow('syntax error');
    });
  });

  describe('isSeedNeeded', () => {
    it('returns true when reminders table is empty (count = 0)', async () => {
      const db = makeDb({ query: vi.fn().mockResolvedValue({ values: [{ count: 0 }] }) });
      expect(await MigrationRunner.isSeedNeeded(db as any)).toBe(true);
    });

    it('returns false when reminders table has rows', async () => {
      const db = makeDb({ query: vi.fn().mockResolvedValue({ values: [{ count: 3 }] }) });
      expect(await MigrationRunner.isSeedNeeded(db as any)).toBe(false);
    });
  });
});
