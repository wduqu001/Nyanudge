import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemindersStore, type Reminder, type Category, type Schedule, type SoundMode, type Character } from '../../core/store/remindersStore';
import { Button } from '../../shared/components/Button/Button';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { ChevronLeft } from 'lucide-react';
import './ReminderEdit.css';

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
        <p>Loading reminder...</p>
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
      newSchedules[0] = { ...newSchedules[0], ...changes };
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
      <header className="edit-header">
        <button className="back-button" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="edit-title">{t('edit_reminder.title', { label: reminder.label })}</h1>
      </header>

      <section className="edit-section">
        <div className="setting-row">
          <div>
            <div className="setting-label">{t('actions.enable')}</div>
            <div className="setting-desc">Receive notifications for this reminder</div>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} categoryColor={reminder.category} />
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
        <div className="section-label">NOTIFICATION</div>
        <div className="select-wrapper">
          <select value={soundMode} onChange={(e) => setSoundMode(e.target.value as SoundMode)}>
            <option value="sound_vibration">{t('settings.notifications.sound_vibration')}</option>
            <option value="vibration_only">{t('settings.notifications.vibration_only')}</option>
            <option value="silent">{t('settings.notifications.silent')}</option>
          </select>
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <div className="section-label">{t('settings.reminders.default_snooze')}</div>
          <div className="select-wrapper">
            <select value={snoozeMins} onChange={(e) => setSnoozeMins(Number(e.target.value))}>
              <option value={5}>5 {t('edit_reminder.minutes')}</option>
              <option value={10}>10 {t('edit_reminder.minutes')}</option>
              <option value={15}>15 {t('edit_reminder.minutes')}</option>
              <option value={30}>30 {t('edit_reminder.minutes')}</option>
              <option value={0}>Off</option>
            </select>
          </div>
        </div>
      </section>

      <section className="edit-section">
        <div className="section-label">{t('edit_reminder.appearance_section')}</div>
        <div className="character-grid">
          {(['mochi', 'sora', 'kuro'] as Character[]).map((char) => (
            <div 
              key={char} 
              className={`character-option ${character === char ? 'active' : ''}`}
              onClick={() => setCharacter(char)}
            >
              <div className="character-icon">
                {/* SVG placeholders for characters could go here or actual SVGs */}
                <svg viewBox="0 0 24 24" fill={character === char ? 'var(--accent)' : 'var(--text-muted)'}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/>
                  <path d="M12 16c-1.33 0-2.61-.38-3.69-1.03-.31-.19-.4-.59-.21-.9.18-.31.58-.41.89-.22.84.5 1.83.78 2.87.82.35 0 .64.29.64.64 0 .38-.3.7-.66.69z"/>
                </svg>
              </div>
              <span className="character-name">{t(`settings.appearance.char_${char}`)}</span>
            </div>
          ))}
        </div>
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
        <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>
          {t('actions.cancel')}
        </Button>
        <Button variant="primary" fullWidth onClick={handleSave}>
          {t('actions.save')}
        </Button>
      </div>
    </div>
  );
};
