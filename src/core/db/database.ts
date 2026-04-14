import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLiteConnection, CapacitorSQLite } from '@capacitor-community/sqlite';
import { MigrationRunner } from './MigrationRunner';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

class DatabaseManager {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  async init(): Promise<SQLiteDBConnection> {
    if (this.isInitialized && this.db) return this.db;

    const platform = Capacitor.getPlatform();

    try {
      if (platform === 'web') {
        const jeepEl = document.querySelector('jeep-sqlite');
        if (jeepEl) {
          jeepSqlite(window);
          await customElements.whenDefined('jeep-sqlite');
          await this.sqlite.initWebStore();
        }
      }

      const isNative = platform === 'ios' || platform === 'android';
      const isEncrypted = isNative;
      const encryptionMode = isNative ? 'encryption' : 'no-encryption';

      if (isNative) {
        // For production, retrieve this secret securely from native key storage.
        // For this portfolio piece, a static passphrase enables the SQLCipher implementation.
        console.log('[DatabaseManager] Applying SQLCipher encryption at rest.');
        await this.sqlite.setEncryptionSecret('NyanudgeSecurePassphrase2026!');
      }

      this.db = await this.sqlite.createConnection(
        'nyanudge_v1',
        isEncrypted,
        encryptionMode,
        1,
        false,
      );

      await this.db.open();

      // Run migrations
      await MigrationRunner.runMigrations(this.db);

      this.isInitialized = true;
      console.log('[DatabaseManager] SQLite initialized and migrations applied.');
      return this.db;
    } catch (err) {
      console.error('[DatabaseManager] Error initializing database:', err);
      throw err;
    }
  }

  get connection(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('[DatabaseManager] Database connection not established. Call init() first.');
    }
    return this.db;
  }
}

export const dbManager = new DatabaseManager();
