import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemindersStore } from '../../core/store/remindersStore';

import { NyaButton } from '../../shared/components/Button/NyaButton';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { NyaSelect } from '../../shared/components/Select/NyaSelect';
import { NyaHeader } from '../../shared/components/Header/NyaHeader';
import { CharacterSelect } from '../../shared/components/CharacterSelect/CharacterSelect';
import { getLocalizedWeekdays } from '../../shared/utils/dateUtils';
import './ReminderEdit.css';

const categoryColorMapping: Record<
  string,
  'water' | 'food' | 'exercise' | 'bathroom' | 'medicine'
> = {
  water: 'water',
  meal: 'food',
  exercise: 'exercise',
  bathroom: 'bathroom',
  medicine: 'medicine',
};

interface FormProps {
  initialReminder: Partial<Reminder> | null;
  isNew: boolean;
  onSave: (data: Partial<Reminder>) => void;
  onArchive: () => void;
}

const ReminderForm: React.FC<FormProps> = ({ initialReminder, isNew, onSave, onArchive }) => {
  const { t, i18n } = useTranslation();
  const [label, setLabel] = useState(initialReminder?.label || '');
  const [enabled, setEnabled] = useState(initialReminder?.enabled ?? true);
  const [soundMode, setSoundMode] = useState<SoundMode>(
    initialReminder?.soundMode || 'sound_vibration',
  );
  const [snoozeMins, setSnoozeMins] = useState(initialReminder?.snoozeMins || 10);
  const [character, setCharacter] = useState<Character>(initialReminder?.character || 'mochi');
  const [customMessage, setCustomMessage] = useState(initialReminder?.customMessage || '');
  const [schedules, setSchedules] = useState<Schedule[]>(initialReminder?.schedules || []);
  const [category, setCategory] = useState<Category>(initialReminder?.category || 'water');

  const handleSave = () => {
    onSave({
      label,
      enabled,
      soundMode,
      snoozeMins,
      character,
      customMessage: customMessage || undefined,
      schedules,
      category,
    });
  };

  const updateMainSchedule = (changes: Partial<Schedule>) => {
    const newSchedules = [...schedules];
    if (newSchedules.length === 0) {
      newSchedules.push({
        id: crypto.randomUUID(),
        reminderId: initialReminder?.id ?? '',
        type: category === 'water' || category === 'bathroom' ? 'interval' : 'fixed',
        timeValue: category === 'water' || category === 'bathroom' ? '120' : '08:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '07:00',
        endTime: '21:00',
        ...changes,
      });
    } else {
      const first = newSchedules[0];
      if (first) {
        newSchedules[0] = { ...first, ...changes };
      }
    }
    setSchedules(newSchedules);
  };

  const mainSchedule = schedules[0] || {
    type: category === 'water' || category === 'bathroom' ? 'interval' : 'fixed',
    timeValue: category === 'water' || category === 'bathroom' ? '120' : '08:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '07:00',
    endTime: '21:00',
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = mainSchedule.daysOfWeek || [];
    let newDays;
    if (currentDays.includes(dayIndex)) {
      newDays = currentDays.filter((d) => d !== dayIndex);
    } else {
      newDays = [...currentDays, dayIndex].sort();
    }
    updateMainSchedule({ daysOfWeek: newDays });
  };

  const days = getLocalizedWeekdays(i18n.language);

  return (
    <div className="reminder-edit-container">
      <NyaHeader title={isNew ? t('edit_reminder.title_new') : t('edit_reminder.title_edit')} />

      <main className="reminder-edit-form">
        <section className="form-section">
          <label className="form-label">{t('edit_reminder.category')}</label>
          <div className="category-select">
            {(['water', 'meal', 'exercise', 'bathroom', 'medicine'] as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-btn ${category === cat ? 'active' : ''}`}
                style={
                  {
                    '--cat-color': `var(--color-${categoryColorMapping[cat] || 'accent-400'})`,
                  } as React.CSSProperties
                }
                onClick={() => setCategory(cat)}
              >
                {t(`categories.${cat}.name`)}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <label className="form-label" htmlFor="label-input">
            {t('edit_reminder.label')}
          </label>
          <input
            id="label-input"
            className="form-input"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t(`categories.${category}.name`)}
          />
        </section>

        <section className="form-section">
          <div className="toggle-row">
            <span className="form-label">{t('edit_reminder.enabled')}</span>
            <Toggle checked={enabled} onChange={setEnabled} />
          </div>
        </section>

        <section className="form-section">
          <label className="form-label">{t('edit_reminder.schedule_type')}</label>
          <div className="schedule-type-btns">
            <button
              type="button"
              className={`type-btn ${mainSchedule.type === 'fixed' ? 'active' : ''}`}
              onClick={() => updateMainSchedule({ type: 'fixed', timeValue: '08:00' })}
            >
              {t('edit_reminder.type_fixed')}
            </button>
            <button
              type="button"
              className={`type-btn ${mainSchedule.type === 'interval' ? 'active' : ''}`}
              onClick={() => updateMainSchedule({ type: 'interval', timeValue: '120' })}
            >
              {t('edit_reminder.type_interval')}
            </button>
          </div>
        </section>

        {mainSchedule.type === 'fixed' ? (
          <section className="form-section animate-in">
            <label className="form-label">{t('edit_reminder.time')}</label>
            <input
              className="form-input"
              type="time"
              value={mainSchedule.timeValue}
              onChange={(e) => updateMainSchedule({ timeValue: e.target.value })}
            />
          </section>
        ) : (
          <section className="form-section animate-in">
            <label className="form-label">{t('edit_reminder.minutes')}</label>
            <NyaSelect
              value={mainSchedule.timeValue || ''}
              onChange={(val) => updateMainSchedule({ timeValue: String(val) })}
              options={[
                { label: `30 ${t('edit_reminder.mins_label')}`, value: '30' },
                { label: `60 ${t('edit_reminder.mins_label')}`, value: '60' },
                { label: `90 ${t('edit_reminder.mins_label')}`, value: '90' },
                { label: `120 ${t('edit_reminder.mins_label')}`, value: '120' },
                { label: `180 ${t('edit_reminder.mins_label')}`, value: '180' },
                { label: `240 ${t('edit_reminder.mins_label')}`, value: '240' },
              ]}
            />
            <div className="window-row">
              <div>
                <label className="form-label sub">{t('edit_reminder.start')}</label>
                <input
                  className="form-input"
                  type="time"
                  value={mainSchedule.startTime}
                  onChange={(e) => updateMainSchedule({ startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label sub">{t('edit_reminder.end')}</label>
                <input
                  className="form-input"
                  type="time"
                  value={mainSchedule.endTime}
                  onChange={(e) => updateMainSchedule({ endTime: e.target.value })}
                />
              </div>
            </div>
          </section>
        )}

        <section className="form-section">
          <label className="form-label">{t('edit_reminder.days')}</label>
          <div className="days-row">
            {days.map((day, idx) => (
              <button
                key={day}
                type="button"
                className={`day-btn ${mainSchedule.daysOfWeek?.includes(idx) ? 'active' : ''}`}
                onClick={() => toggleDay(idx)}
              >
                {day.charAt(0)}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <label className="form-label">{t('edit_reminder.sound_mode')}</label>
          <NyaSelect
            value={soundMode}
            onChange={(val) => setSoundMode(val as SoundMode)}
            options={[
              { label: t('settings.sound_vibration'), value: 'sound_vibration' },
              { label: t('settings.vibration_only'), value: 'vibration_only' },
              { label: t('settings.silent'), value: 'silent' },
            ]}
          />
        </section>

        <section className="form-section">
          <label className="form-label">{t('settings.default_snooze')}</label>
          <NyaSelect
            value={snoozeMins}
            onChange={(val) => setSnoozeMins(Number(val))}
            options={[
              { label: `5 ${t('edit_reminder.mins_label')}`, value: 5 },
              { label: `10 ${t('edit_reminder.mins_label')}`, value: 10 },
              { label: `15 ${t('edit_reminder.mins_label')}`, value: 15 },
              { label: `30 ${t('edit_reminder.mins_label')}`, value: 30 },
            ]}
          />
        </section>

        <section className="form-section">
          <label className="form-label">{t('edit_reminder.character')}</label>
          <CharacterSelect value={character} onChange={setCharacter} />
        </section>

        <section className="form-section">
          <label className="form-label">{t('edit_reminder.custom_message')}</label>
          <textarea
            className="form-textarea"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={t(`messages.${category}.0`)}
          />
        </section>

        {!isNew && (
          <section className="form-section">
            <NyaButton variant="secondary" onClick={onArchive} className="archive-btn">
              {t('actions.archive')}
            </NyaButton>
          </section>
        )}
      </main>

      <footer className="reminder-edit-footer">
        <NyaButton variant="secondary" onClick={() => window.history.back()}>
          {t('actions.cancel')}
        </NyaButton>
        <NyaButton variant="primary" onClick={handleSave}>
          {t('actions.save')}
        </NyaButton>
      </footer>
    </div>
  );
};

export const ReminderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { reminders, updateReminder, addReminder, isLoaded } = useRemindersStore();
  const isNew = id === 'new';

  if (!isLoaded) {
    return (
      <div className="reminder-edit-container">
        <p>{t('edit_reminder.loading')}</p>
      </div>
    );
  }

  const existing = reminders.find((r) => r.id === id);

  if (!isNew && !existing) {
    return (
      <div className="reminder-edit-container">
        <NyaHeader title={t('edit_reminder.not_found')} />
        <p style={{ padding: '20px', textAlign: 'center' }}>{t('edit_reminder.not_found_desc')}</p>
        <NyaButton onClick={() => navigate(-1)}>{t('actions.back')}</NyaButton>
      </div>
    );
  }

  const handleSave = (data: Partial<Reminder>) => {
    if (isNew) {
      addReminder({
        id: crypto.randomUUID(),
        label: data.label || '',
        enabled: data.enabled ?? true,
        soundMode: data.soundMode || 'sound_vibration',
        snoozeMins: data.snoozeMins || 10,
        character: data.character || 'mochi',
        customMessage: data.customMessage,
        schedules: data.schedules || [],
        category: data.category || 'water',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (existing) {
      updateReminder(existing.id, data);
    }
    navigate(-1);
  };

  const handleArchive = () => {
    if (existing) {
      updateReminder(existing.id, { archived: true, enabled: false });
      navigate(-1);
    }
  };

  return (
    <ReminderForm
      initialReminder={existing || null}
      isNew={isNew}
      onSave={handleSave}
      onArchive={handleArchive}
    />
  );
};
