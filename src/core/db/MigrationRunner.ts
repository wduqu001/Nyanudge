import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { migrations } from './migrations';

export class MigrationRunner {
  private static DB_VERSION_KEY = '__db_version';

  static async runMigrations(db: SQLiteDBConnection): Promise<void> {
    console.log('[MigrationRunner] Checking for unapplied migrations...');
    
    // 1. Ensure preferences table exists (needed for tracking version)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS preferences (
        "key" TEXT PRIMARY KEY NOT NULL,
        "value" TEXT NOT NULL,
        "updated_at" INTEGER NOT NULL
      );
    `);

    // 2. Determine current version
    const res = await db.query('SELECT value FROM preferences WHERE key = ?', [this.DB_VERSION_KEY]);
    let currentVersion = 0;
    
    if (res.values && res.values.length > 0) {
      currentVersion = parseInt(res.values[0].value, 10);
    }

    console.log(`[MigrationRunner] Current DB version: ${currentVersion}`);

    // 3. Filter for unapplied migrations
    const pendingMigrations = migrations.filter(m => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      console.log('[MigrationRunner] No pending migrations.');
      return;
    }

    // 4. Run each migration
    for (const migration of pendingMigrations) {
      console.log(`[MigrationRunner] Applying version ${migration.version}: ${migration.description}`);
      
      try {
        await db.execute(migration.up);
        
        // Update version in preferences
        const now = Date.now();
        await db.run(
          `INSERT INTO preferences (key, value, updated_at) VALUES (?, ?, ?) 
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          [this.DB_VERSION_KEY, migration.version.toString(), now]
        );
        
        console.log(`[MigrationRunner] Applied version ${migration.version} successfully.`);
      } catch (err) {
        console.error(`[MigrationRunner] FAILED applying version ${migration.version}:`, err);
        throw err;
      }
    }
    
    console.log('[MigrationRunner] Migration phase complete.');
  }

  static async isSeedNeeded(db: SQLiteDBConnection): Promise<boolean> {
    // If table reminders is empty, we need seed
    const res = await db.query('SELECT COUNT(*) as count FROM reminders');
    return res.values?.[0].count === 0;
  }
}
