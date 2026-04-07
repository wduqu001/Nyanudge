import { dbManager } from './database';
import { defaultReminders } from './seed';
import { CompletionEntry } from '../store/statsStore';

export class ReminderService {
  static async getAllReminders(): Promise<Reminder[]> {
    const db = dbManager.connection;
    const res = await db.query('SELECT * FROM reminders WHERE archived = 0');

    const reminders: Reminder[] = [];
    if (res.values) {
      for (const row of res.values) {
        const schedRes = await db.query('SELECT * FROM schedules WHERE reminder_id = ?', [row.id]);
        const schedules: Schedule[] = (schedRes.values || []).map(s => ({
          ...s,
          daysOfWeek: s.days_of_week ? JSON.parse(s.days_of_week) : undefined,
          timeValue:  s.time_value,
          startTime:  s.start_time,
          endTime:    s.end_time,
          notifId:    s.notif_id,
        }));

        reminders.push({
          id:            row.id,
          category:      row.category,
          label:         row.label,
          enabled:       !!row.enabled,
          soundMode:     row.sound_mode,
          snoozeMins:    row.snooze_mins,
          character:     row.character,
          customMessage: row.custom_message,
          archived:      !!row.archived,
          createdAt:     row.created_at,
          updatedAt:     row.updated_at,
          schedules,
        });
      }
    }
    return reminders;
  }

  static async seedIfEmpty(): Promise<void> {
    const db = dbManager.connection;
    const res = await db.query('SELECT COUNT(*) as count FROM reminders');
    const count = res.values?.[0].count || 0;

    if (count === 0) {
      console.log('[ReminderService] Seeding default reminders...');
      for (const r of defaultReminders) {
        await this.addReminder(r as Reminder);
      }
    }
  }

  static async addReminder(r: Reminder): Promise<void> {
    const db = dbManager.connection;
    await db.run(
      `INSERT INTO reminders
         (id, category, label, enabled, archived, sound_mode, snooze_mins, character, custom_message, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.category, r.label, r.enabled ? 1 : 0, r.archived ? 1 : 0,
       r.soundMode, r.snoozeMins, r.character, r.customMessage, r.createdAt, r.updatedAt]
    );

    for (const s of r.schedules) {
      await db.run(
        `INSERT INTO schedules (id, reminder_id, type, time_value, days_of_week, start_time, end_time, notif_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, r.id, s.type, s.timeValue,
         s.daysOfWeek ? JSON.stringify(s.daysOfWeek) : null,
         s.startTime, s.endTime, s.notifId]
      );
    }
  }

  static async updateReminder(id: string, changes: Partial<Reminder>): Promise<void> {
    const db = dbManager.connection;
    const fields: string[] = [];
    const values: unknown[] = [];

    if (changes.label         !== undefined) { fields.push('label = ?');         values.push(changes.label); }
    if (changes.enabled       !== undefined) { fields.push('enabled = ?');       values.push(changes.enabled ? 1 : 0); }
    if (changes.archived      !== undefined) { fields.push('archived = ?');      values.push(changes.archived ? 1 : 0); }
    if (changes.soundMode     !== undefined) { fields.push('sound_mode = ?');    values.push(changes.soundMode); }
    if (changes.snoozeMins    !== undefined) { fields.push('snooze_mins = ?');   values.push(changes.snoozeMins); }
    if (changes.character     !== undefined) { fields.push('character = ?');     values.push(changes.character); }
    if (changes.customMessage !== undefined) { fields.push('custom_message = ?'); values.push(changes.customMessage); }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(Date.now(), id);
      await db.run(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    if (changes.schedules) {
      await db.run('DELETE FROM schedules WHERE reminder_id = ?', [id]);
      for (const s of changes.schedules) {
        await db.run(
          `INSERT INTO schedules (id, reminder_id, type, time_value, days_of_week, start_time, end_time, notif_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.id, id, s.type, s.timeValue,
           s.daysOfWeek ? JSON.stringify(s.daysOfWeek) : null,
           s.startTime, s.endTime,
           s.notifId ?? Math.floor(Math.random() * 2_000_000)]
        );
      }
    }
  }

  static async deleteReminder(id: string): Promise<void> {
    const db = dbManager.connection;
    await db.run('DELETE FROM reminders WHERE id = ?', [id]);
  }

  // ── Completions ────────────────────────────────────────────────────────────

  static async addCompletion(entry: CompletionEntry): Promise<void> {
    const db = dbManager.connection;
    // Table is `completion_log` (matches migration v1)
    await db.run(
      `INSERT INTO completion_log (id, reminder_id, category, completed_at, was_skipped)
       VALUES (?, ?, ?, ?, ?)`,
      [entry.id, entry.reminderId, entry.category, entry.completedAt, entry.wasSkipped ? 1 : 0]
    );
  }

  /** Load the 200 most-recent completions from disk (called on app start). */
  static async getRecentCompletions(): Promise<CompletionEntry[]> {
    const db = dbManager.connection;
    const res = await db.query(
      `SELECT id, reminder_id, category, completed_at, was_skipped
         FROM completion_log
        ORDER BY completed_at DESC
        LIMIT 200`
    );
    return (res.values || []).map(row => ({
      id:          row.id,
      reminderId:  row.reminder_id,
      category:    row.category as Category,
      completedAt: row.completed_at as number,
      wasSkipped:  !!row.was_skipped,
    }));
  }
}
