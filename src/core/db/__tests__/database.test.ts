import { describe, it, expect, vi } from 'vitest';

// ── vi.mock declarations are hoisted — all values must be inside factories ─────
vi.mock('@capacitor-community/sqlite', () => {
  const mockConn = {
    isDBOpen: vi.fn().mockResolvedValue({ result: false }),
    open: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ values: [] }),
  };

  class SQLiteConnection {
    initWebStore = vi.fn().mockResolvedValue(undefined);
    createConnection = vi.fn().mockResolvedValue(mockConn);
    isConnection = vi.fn().mockResolvedValue({ result: false });
    echo = vi.fn().mockResolvedValue({ value: 'ok' });
  }

  return { CapacitorSQLite: {}, SQLiteConnection };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'web', isNativePlatform: () => false },
}));

vi.mock('jeep-sqlite/loader', () => ({ defineCustomElements: vi.fn() }));

// Static import — runs AFTER vi.mock declarations
import { dbManager } from '../database';

describe('database.ts — DatabaseManager', () => {
  it('connection getter throws before init() is called (guard branch coverage)', () => {
    // Before init(), db is null, so accessing connection should throw
    expect(() => dbManager.connection).toThrow(/not established|init\(\) first/i);
  });

  it('exports a dbManager singleton with an init() method', () => {
    expect(dbManager).toBeDefined();
    expect(typeof dbManager.init).toBe('function');
  });

  it("init() doesn't throw on web platform", async () => {
    await expect(dbManager.init()).resolves.not.toThrow();
  });

  it('init() returns immediately if already initialized', async () => {
    // Already initialized from previous test
    const db = await dbManager.init();
    expect(db).toBeDefined();
    // This hits 'if (this.isInitialized && this.db) return this.db' branch
  });

  it('connection property exists on the manager', () => {
    expect('connection' in dbManager).toBe(true);
  });
});
