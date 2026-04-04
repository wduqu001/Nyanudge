export interface Migration {
  version: number;
  description: string;
  up: string;
  down: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema',
    up: `
      CREATE TABLE IF NOT EXISTS preferences (
        "key" TEXT PRIMARY KEY NOT NULL,
        "value" TEXT NOT NULL,
        "updated_at" INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reminders (
        "id" TEXT PRIMARY KEY NOT NULL,
        "category" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "enabled" INTEGER DEFAULT 1,
        "sound_mode" TEXT DEFAULT 'sound_vibration',
        "snooze_mins" INTEGER DEFAULT 10,
        "character" TEXT DEFAULT 'mochi',
        "custom_message" TEXT,
        "archived" INTEGER DEFAULT 0,
        "created_at" INTEGER NOT NULL,
        "updated_at" INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS schedules (
        "id" TEXT PRIMARY KEY NOT NULL,
        "reminder_id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "time_value" TEXT,
        "days_of_week" TEXT,
        "start_time" TEXT,
        "end_time" TEXT,
        "notif_id" INTEGER,
        FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS completion_log (
        "id" TEXT PRIMARY KEY NOT NULL,
        "reminder_id" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "completed_at" INTEGER NOT NULL,
        "was_skipped" INTEGER DEFAULT 0,
        FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id")
      );
      CREATE TABLE IF NOT EXISTS streaks (
        "category" TEXT PRIMARY KEY NOT NULL,
        "current_streak" INTEGER DEFAULT 0,
        "longest_streak" INTEGER DEFAULT 0,
        "last_completed_date" TEXT
      );
    `,
    down: `
      DROP TABLE IF EXISTS streaks;
      DROP TABLE IF EXISTS completion_log;
      DROP TABLE IF EXISTS schedules;
      DROP TABLE IF EXISTS reminders;
      DROP TABLE IF EXISTS preferences;
    `
  }
];
