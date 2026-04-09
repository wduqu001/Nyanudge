import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { useStatsStore } from '../../core/store/statsStore';
import { ReminderService } from '../../core/db/ReminderService';
import { NyaButton } from '../../shared/components/Button/NyaButton';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { NyaHeader } from '../../shared/components/Header/NyaHeader';
import { CharacterSelect } from '../../shared/components/CharacterSelect/CharacterSelect';
import { NyaSelect } from '../../shared/components/Select/NyaSelect';
import styles from './SettingsScreen.module.css';

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preferences, updatePreference, resetPreferences } = usePreferencesStore();
  const { setRecentCompletions, setStats } = useStatsStore();

  const handleLanguageChange = (newLang: string) => {
    updatePreference('language', newLang);
    i18n.changeLanguage(newLang);
  };

  const handleExportCSV = () => {
    alert(t('settings.data.exporting'));
  };

  const handleClearHistory = () => {
    if (window.confirm(t('settings.data.clear_confirm'))) {
      // Clear in-memory store immediately so the UI reflects the change
      setRecentCompletions([]);
      setStats({});
      // Persist the wipe to the database
      ReminderService.clearHistory().catch(err =>
        console.error('[Settings] Failed to clear history from DB:', err)
      );
      alert(t('settings.data.history_cleared'));
    }
  };

  return (
    <div className={styles.container}>
      <NyaHeader title={t('settings.title')} />

      <div className={styles.content}>
        {/* NOTIFICATIONS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.notifications.title')}</h2>
          
          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.notifications.default_sound_mode')}</label>
            <NyaSelect 
              value={preferences.defaultSoundMode}
              onChange={(val) => updatePreference('defaultSoundMode', val)}
              options={[
                { value: 'sound_vibration', label: t('settings.notifications.sound_vibration') },
                { value: 'vibration_only', label: t('settings.notifications.vibration_only') },
                { value: 'silent', label: t('settings.notifications.silent') },
              ]}
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.notifications.notification_style')}</label>
            <NyaSelect 
              value={preferences.notificationStyle}
              onChange={(val) => updatePreference('notificationStyle', val)}
              options={[
                { value: 'standard', label: t('settings.notifications.style_standard') },
                { value: 'compact', label: t('settings.notifications.style_compact') },
              ]}
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.notifications.dnd')}</label>
            <div className={styles.timeInputs}>
              <div className={styles.timeInputWrapper}>
                <span className={styles.timeLabel}>{t('settings.notifications.start_time')}</span>
                <input 
                  type="time" 
                  className={styles.timeInput}
                  value={preferences.dndStart}
                  onChange={(e) => updatePreference('dndStart', e.target.value)}
                />
              </div>
              <div className={styles.timeInputWrapper}>
                <span className={styles.timeLabel}>{t('settings.notifications.end_time')}</span>
                <input 
                  type="time" 
                  className={styles.timeInput}
                  value={preferences.dndEnd}
                  onChange={(e) => updatePreference('dndEnd', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.appearance.title')}</h2>
          
          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.appearance.theme')}</label>
            <NyaSelect 
              value={preferences.theme}
              onChange={(val) => updatePreference('theme', val)}
              options={[
                { value: 'system', label: t('settings.appearance.theme_system') },
                { value: 'light', label: t('settings.appearance.theme_light') },
                { value: 'dark', label: t('settings.appearance.theme_dark') },
              ]}
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.appearance.cat_character')}</label>
            <CharacterSelect 
              value={preferences.character}
              onChange={(val) => updatePreference('character', val)}
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.appearance.language')}</label>
            <NyaSelect 
              value={preferences.language}
              onChange={handleLanguageChange}
              options={[
                { value: 'en', label: t('settings.appearance.lang_en') },
                { value: 'pt-BR', label: t('settings.appearance.lang_ptBR') },
                { value: 'ja', label: t('settings.appearance.lang_ja') },
                { value: 'es-ES', label: t('settings.appearance.lang_esES') },
              ]}
            />
          </div>
        </section>

        {/* REMINDERS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.reminders.title')}</h2>
          
          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.reminders.default_snooze')}</label>
            <NyaSelect 
              value={preferences.defaultSnoozeMins.toString()}
              onChange={(val) => updatePreference('defaultSnoozeMins', parseInt(val))}
              options={[
                { value: '5', label: t('actions.minutes_count', { count: 5 }) },
                { value: '10', label: t('actions.minutes_count', { count: 10 }) },
                { value: '15', label: t('actions.minutes_count', { count: 15 }) },
                { value: '30', label: t('actions.minutes_count', { count: 30 }) },
              ]}
            />
          </div>

          <div className={styles.settingGroupRow}>
            <div className={styles.settingTextContent}>
              <label className={styles.label}>{t('settings.reminders.mark_done_on_open')}</label>
              <p className={styles.description}>{t('settings.reminders.mark_done_desc')}</p>
            </div>
            <Toggle 
              checked={preferences.markAsDoneOnOpen} 
              onChange={(checked) => updatePreference('markAsDoneOnOpen', checked)} 
            />
          </div>

          <div className={styles.settingGroup}>
            <NyaButton variant="secondary" fullWidth onClick={resetPreferences}>
              {t('settings.reminders.reset_defaults')}
            </NyaButton>
          </div>
        </section>

        {/* DATA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.data.title')}</h2>
          
          <div className={styles.settingGroup}>
            <NyaButton variant="secondary" fullWidth onClick={handleExportCSV}>
              {t('settings.data.export_csv')}
            </NyaButton>
          </div>

          <div className={styles.settingGroup}>
            <NyaButton variant="ghost" className={styles.destructiveButton} fullWidth onClick={handleClearHistory}>
              {t('settings.data.clear_history')}
            </NyaButton>
          </div>

          <div className={styles.versionInfo}>
            {t('settings.data.app_version')} {t('settings.data.version_format', { version: '1.0.0', build: '1' })}
          </div>
        </section>
      </div>
    </div>
  );
};
