import { dbManager } from './database';

export class PreferenceService {
  private static TABLE = 'preferences';

  static async getPreferences(): Promise<Partial<Preferences>> {
    const db = dbManager.connection;
    const res = await db.query(`SELECT * FROM ${this.TABLE}`);

    const prefs: Partial<Preferences> = {};
    if (res.values) {
      for (const row of res.values) {
        let value = row.value;
        // Basic type parsing
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value)) && value.trim() !== '') value = Number(value);

        prefs[row.key as keyof Preferences] = value as any;
      }
    }
    return prefs;
  }

  static async updatePreference(key: string, value: string | number | boolean): Promise<void> {
    const db = dbManager.connection;
    const now = Date.now();
    const strValue = String(value);

    await db.run(
      `INSERT INTO ${this.TABLE} (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, strValue, now],
    );
  }

  static async saveAll(prefs: Preferences): Promise<void> {
    for (const [key, value] of Object.entries(prefs)) {
      await this.updatePreference(key, value);
    }
  }
}
