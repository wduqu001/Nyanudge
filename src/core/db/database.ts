import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLiteConnection, CapacitorSQLite } from '@capacitor-community/sqlite';
import { MigrationRunner } from './MigrationRunner';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

/**
 * SQLCipher mode for opening the database. 'encryption' converts an existing plain file and
 * fails when there is none, so a fresh install must use 'secret', which creates it encrypted.
 */
export function encryptionModeFor(exists: boolean, encrypted: boolean): 'secret' | 'encryption' {
  return exists && !encrypted ? 'encryption' : 'secret';
}

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

      if (isNative) {
        // For production, retrieve this secret securely from native key storage.
        // For this portfolio piece, a static passphrase enables the SQLCipher implementation.
        console.log('[DatabaseManager] Applying SQLCipher encryption at rest.');
        try {
          await this.sqlite.setEncryptionSecret('NyanudgeSecurePassphrase2026!');
        } catch (e: any) {
          if (!e.message?.includes('already been set')) {
            throw e;
          }
        }
      }

      let encryptionMode = 'no-encryption';
      if (isNative) {
        const exists = (await this.sqlite.isDatabase('nyanudge_v1')).result ?? false;
        const encrypted = exists && ((await this.sqlite.isDatabaseEncrypted('nyanudge_v1')).result ?? false);
        encryptionMode = encryptionModeFor(exists, encrypted);
      }

      try {
        this.db = await this.sqlite.createConnection(
          'nyanudge_v1',
          isEncrypted,
          encryptionMode,
          1,
          false,
        );
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          this.db = await this.sqlite.retrieveConnection('nyanudge_v1', false);
        } else {
          throw e;
        }
      }

      try {
        await this.db.open();
      } catch (e: any) {
        if (!e.message?.includes('already open')) {
          throw e;
        }
      }

      try {
        await this.db.run('PRAGMA foreign_keys = ON');
      } catch (e: any) {
        console.warn('[DatabaseManager] Could not set PRAGMA foreign_keys:', e);
      }

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
