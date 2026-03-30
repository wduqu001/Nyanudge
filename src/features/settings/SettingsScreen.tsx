import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { Button } from '../../shared/components/Button/Button';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { ArrowLeft } from 'lucide-react';
import styles from './SettingsScreen.module.css';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { preferences, updatePreference, resetPreferences } = usePreferencesStore();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    updatePreference('language', newLang);
    i18n.changeLanguage(newLang);
  };

  const handleExportCSV = () => {
    // Placeholder for export functionality
    alert('Exporting CSV...');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      // Placeholder for clear history functionality
      alert('History cleared.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>{t('settings.title')}</h1>
        <div style={{ width: 24 }} /> {/* Spacer to center title */}
      </header>

      <div className={styles.content}>
        {/* NOTIFICATIONS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.notifications.title')}</h2>
          
          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.notifications.default_sound_mode')}</label>
            <select 
              className={styles.select}
              value={preferences.defaultSoundMode}
              onChange={(e) => updatePreference('defaultSoundMode', e.target.value as any)}
            >
              <option value="sound_vibration">{t('settings.notifications.sound_vibration')}</option>
              <option value="vibration_only">{t('settings.notifications.vibration_only')}</option>
              <option value="silent">{t('settings.notifications.silent')}</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.notifications.notification_style')}</label>
            <select 
              className={styles.select}
              value={preferences.notificationStyle}
              onChange={(e) => updatePreference('notificationStyle', e.target.value as any)}
            >
              <option value="standard">{t('settings.notifications.style_standard')}</option>
              <option value="compact">{t('settings.notifications.style_compact')}</option>
            </select>
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
            <select 
              className={styles.select}
              value={preferences.theme}
              onChange={(e) => updatePreference('theme', e.target.value as any)}
            >
              <option value="system">{t('settings.appearance.theme_system')}</option>
              <option value="light">{t('settings.appearance.theme_light')}</option>
              <option value="dark">{t('settings.appearance.theme_dark')}</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.appearance.cat_character')}</label>
            <select 
              className={styles.select}
              value={preferences.character}
              onChange={(e) => updatePreference('character', e.target.value as any)}
            >
              <option value="mochi">{t('settings.appearance.char_mochi')}</option>
              <option value="sora">{t('settings.appearance.char_sora')}</option>
              <option value="kuro">{t('settings.appearance.char_kuro')}</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.appearance.language')}</label>
            <select 
              className={styles.select}
              value={preferences.language}
              onChange={handleLanguageChange}
            >
              <option value="en">{t('settings.appearance.lang_en')}</option>
              <option value="pt-BR">{t('settings.appearance.lang_ptBR')}</option>
              <option value="ja">{t('settings.appearance.lang_ja')}</option>
              <option value="es-ES">{t('settings.appearance.lang_esES')}</option>
            </select>
          </div>
        </section>

        {/* REMINDERS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.reminders.title')}</h2>
          
          <div className={styles.settingGroup}>
            <label className={styles.label}>{t('settings.reminders.default_snooze')}</label>
            <select 
              className={styles.select}
              value={preferences.defaultSnoozeMins.toString()}
              onChange={(e) => updatePreference('defaultSnoozeMins', parseInt(e.target.value))}
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
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
            <Button variant="secondary" fullWidth onClick={resetPreferences}>
              {t('settings.reminders.reset_defaults')}
            </Button>
          </div>
        </section>

        {/* DATA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.data.title')}</h2>
          
          <div className={styles.settingGroup}>
            <Button variant="secondary" fullWidth onClick={handleExportCSV}>
              {t('settings.data.export_csv')}
            </Button>
          </div>

          <div className={styles.settingGroup}>
            <Button variant="ghost" className={styles.destructiveButton} fullWidth onClick={handleClearHistory}>
              {t('settings.data.clear_history')}
            </Button>
          </div>

          <div className={styles.versionInfo}>
            {t('settings.data.app_version')} 1.0.0 (build 1)
          </div>
        </section>
      </div>
    </div>
  );
};
