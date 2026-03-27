import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// User preferences
export const preferences = sqliteTable('preferences', {
  key:       text('key').primaryKey(),
  value:     text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Reminder definitions
export const reminders = sqliteTable('reminders', {
  id:          text('id').primaryKey(),          // UUID or consistent unique ID
  category:    text('category').notNull(),        // water|meal|exercise|bathroom|medicine
  label:       text('label').notNull(),
  enabled:     integer('enabled', { mode: 'boolean' }).default(true),
  soundMode:   text('sound_mode').default('sound_vibration'),
  snoozeMins:  integer('snooze_mins').default(10),
  character:   text('character').default('mochi'),
  customMessage: text('custom_message'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Scheduled times (one row per scheduled fire rule per reminder)
export const schedules = sqliteTable('schedules', {
  id:         text('id').primaryKey(),
  reminderId: text('reminder_id').notNull().references(() => reminders.id, { onDelete: 'cascade' }),
  type:       text('type').notNull(),  // 'fixed' | 'interval'
  timeValue:  text('time_value'),      // "08:00" for fixed; "120" (mins) for interval
  daysOfWeek: text('days_of_week'),    // JSON stringified array of numbers [0,1,2,3,4,5,6] (0=Sunday)
  startTime:  text('start_time'),      // "07:00" — interval window start
  endTime:    text('end_time'),        // "21:00" — interval window end
  notifId:    integer('notif_id'),     // Capacitor notification ID
});

// Completion log
export const completionLog = sqliteTable('completion_log', {
  id:         text('id').primaryKey(),
  reminderId: text('reminder_id').notNull().references(() => reminders.id),
  category:   text('category').notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
  wasSkipped:  integer('was_skipped', { mode: 'boolean' }).default(false),
});

// Streak tracking
export const streaks = sqliteTable('streaks', {
  category:       text('category').primaryKey(), // water|meal|exercise|bathroom|medicine
  currentStreak:  integer('current_streak').default(0),
  longestStreak:  integer('longest_streak').default(0),
  lastCompletedDate: text('last_completed_date'), // ISO date 'YYYY-MM-DD'
});
