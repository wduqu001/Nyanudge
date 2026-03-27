import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';
import ja from './locales/ja.json';
import esES from './locales/es-ES.json';

i18n.use(initReactI18next).init({
  resources: { 
    en: { translation: en }, 
    'pt-BR': { translation: ptBR }, 
    ja: { translation: ja },
    'es-ES': { translation: esES }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

/**
 * Utility to pick a random message for a given reminder category
 */
export function pickMessage(category: string): string {
  const messages: string[] = i18n.t(`messages.${category}`, { returnObjects: true }) as string[];
  if (!messages || typeof messages === 'string' || messages.length === 0) return 'Meow! Time for your reminder.';
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Returns true if the current locale prefers 12h time (AM/PM)
 */
export function is12Hour(): boolean {
  return i18n.t('formats.time') === '12h';
}

/**
 * Returns the preferred date format string for the current locale
 */
export function getDateFormat(): string {
  return i18n.t('formats.date');
}
