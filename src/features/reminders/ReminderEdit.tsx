import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemindersStore } from '../../core/store/remindersStore';
import type { Reminder, Schedule, SoundMode, Character } from '../../types/nyanudge';
import { NyaButton } from '../../shared/components/Button/NyaButton';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { NyaSelect } from '../../shared/components/Select/NyaSelect';
import { NyaHeader } from '../../shared/components/Header/NyaHeader';
import { CharacterSelect } from '../../shared/components/CharacterSelect/CharacterSelect';
import './ReminderEdit.css';

const categoryColorMapping: Record<string, 'water' | 'food' | 'exercise' | 'bathroom' | 'medicine'> = {
  water: 'water',
  meal: 'food',
  exercise: 'exercise',
  bathroom: 'bathroom',
  medicine: 'medicine',
};

export const ReminderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { reminders, updateReminder } = useRemindersStore();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [soundMode, setSoundMode] = useState<SoundMode>('sound_vibration');
  const [snoozeMins, setSnoozeMins] = useState(10);
  const [character, setCharacter] = useState<Character>('mochi');
  const [customMessage, setCustomMessage] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const existing = reminders.find((r) => r.id === id);
    if (existing) {
      setReminder(existing);
      setLabel(existing.label);
      setEnabled(existing.enabled);
      setSoundMode(existing.soundMode);
      setSnoozeMins(existing.snoozeMins);
      setCharacter(existing.character);
      setCustomMessage(existing.customMessage || '');
      setSchedules(existing.schedules || []);
    } else {
      // If not found, possibly still loading or not exists
    }
  }, [id, reminders]);

  if (!reminder) {
    return (
      <div className="reminder-edit-container">
        <p>{t('edit_reminder.loading')}</p>
      </div>
    );
  }

  const handleSave = () => {
    updateReminder(reminder.id, {
      label,
      enabled,
      soundMode,
      snoozeMins,
      character,
      customMessage: customMessage || undefined,
      schedules
    });
    navigate(-1);
  };

  const updateMainSchedule = (changes: Partial<Schedule>) => {
    const newSchedules = [...schedules];
    if (newSchedules.length === 0) {
      newSchedules.push({
        id: crypto.randomUUID(),
        reminderId: reminder.id,
        type: reminder.category === 'water' || reminder.category === 'bathroom' ? 'interval' : 'fixed',
        ...changes
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
    type: reminder.category === 'water' || reminder.category === 'bathroom' ? 'interval' : 'fixed',
    timeValue: reminder.category === 'water' || reminder.category === 'bathroom' ? '120' : '08:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '07:00',
    endTime: '21:00'
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = mainSchedule.daysOfWeek || [];
    let newDays;
    if (currentDays.includes(dayIndex)) {
      newDays = currentDays.filter(d => d !== dayIndex);
    } else {
      newDays = [...currentDays, dayIndex].sort();
    }
    updateMainSchedule({ daysOfWeek: newDays });
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="reminder-edit-container">
      <NyaHeader title={t('edit_reminder.title', { label: reminder.label })} />

      <section className="edit-section">
        <div className="setting-row">
          <div>
            <div className="setting-label">{t('actions.enable')}</div>
            <div className="setting-desc">{t('edit_reminder.enable_desc')}</div>
          </div>
          <Toggle 
            checked={enabled} 
            onChange={setEnabled} 
            categoryColor={categoryColorMapping[reminder.category]} 
          />
        </div>
      </section>

      <section className="edit-section">
        <div className="section-label">{t('edit_reminder.schedule_section')}</div>
        
        <div className="schedule-type-selector">
          <button 
            className={`type-button ${mainSchedule.type === 'fixed' ? 'active' : ''}`}
            onClick={() => updateMainSchedule({ type: 'fixed' })}
          >
            {t('edit_reminder.type_fixed')}
          </button>
          <button 
            className={`type-button ${mainSchedule.type === 'interval' ? 'active' : ''}`}
            onClick={() => updateMainSchedule({ type: 'interval' })}
          >
            {t('edit_reminder.type_interval')}
          </button>
        </div>

        {mainSchedule.type === 'fixed' ? (
          <div className="time-row">
            <input 
              type="time" 
              className="time-input" 
              value={mainSchedule.timeValue} 
              onChange={(e) => updateMainSchedule({ timeValue: e.target.value })} 
            />
          </div>
        ) : (
          <>
            <div className="setting-row">
              <span className="setting-label">{t('edit_reminder.interval_label')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="number" 
                  className="time-input" 
                  style={{ width: '80px' }}
                  value={mainSchedule.timeValue} 
                  onChange={(e) => updateMainSchedule({ timeValue: e.target.value })} 
                />
                <span className="setting-desc">{t('edit_reminder.minutes')}</span>
              </div>
            </div>
            <div className="time-row">
              <div style={{ flex: 1 }}>
                <div className="section-label" style={{ fontSize: '11px' }}>{t('edit_reminder.from')}</div>
                <input 
                  type="time" 
                  className="time-input" 
                  value={mainSchedule.startTime} 
                  onChange={(e) => updateMainSchedule({ startTime: e.target.value })} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <div className="section-label" style={{ fontSize: '11px' }}>{t('edit_reminder.to')}</div>
                <input 
                  type="time" 
                  className="time-input" 
                  value={mainSchedule.endTime} 
                  onChange={(e) => updateMainSchedule({ endTime: e.target.value })} 
                />
              </div>
            </div>
          </>
        )}
      </section>

      <section className="edit-section">
        <div className="section-label">{t('edit_reminder.repeat_section')}</div>
        <div className="days-selector">
          {days.map((day, index) => (
            <button
              key={index}
              className={`day-circle ${(mainSchedule.daysOfWeek || []).includes(index) ? 'active' : ''}`}
              onClick={() => toggleDay(index)}
            >
              {day}
            </button>
          ))}
        </div>
      </section>

      <section className="edit-section">
        <div className="section-label">{t('edit_reminder.notification_title')}</div>
        <NyaSelect 
          value={soundMode}
          onChange={(val) => setSoundMode(val as SoundMode)}
          options={[
            { value: 'sound_vibration', label: t('settings.notifications.sound_vibration') },
            { value: 'vibration_only', label: t('settings.notifications.vibration_only') },
            { value: 'silent', label: t('settings.notifications.silent') },
          ]}
        />
        
        <div style={{ marginTop: '16px' }}>
          <div className="section-label">{t('settings.reminders.default_snooze')}</div>
          <NyaSelect 
            value={snoozeMins.toString()}
            onChange={(val) => setSnoozeMins(Number(val))}
            options={[
              { value: '5', label: `5 ${t('edit_reminder.minutes')}` },
              { value: '10', label: `10 ${t('edit_reminder.minutes')}` },
              { value: '15', label: `15 ${t('edit_reminder.minutes')}` },
              { value: '30', label: `30 ${t('edit_reminder.minutes')}` },
              { value: '0', label: t('edit_reminder.off') },
            ]}
          />
        </div>
      </section>

      <section className="edit-section">
        <div className="section-label">{t('edit_reminder.appearance_section')}</div>
        <CharacterSelect 
          value={character}
          onChange={setCharacter}
        />
      </section>

      <section className="edit-section">
        <div className="section-label">{t('edit_reminder.custom_message_label')}</div>
        <textarea 
          className="input-field" 
          placeholder={t('edit_reminder.custom_message_placeholder')}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={3}
        />
      </section>

      <div className="action-buttons">
        <NyaButton variant="secondary" fullWidth onClick={() => navigate(-1)}>
          {t('actions.cancel')}
        </NyaButton>
        <NyaButton variant="primary" fullWidth onClick={handleSave}>
          {t('actions.save')}
        </NyaButton>
      </div>
    </div>
  );
};
