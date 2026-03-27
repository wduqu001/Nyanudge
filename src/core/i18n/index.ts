import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';
import ja from './locales/ja.json';

i18n.use(initReactI18next).init({
  resources: { 
    en: { translation: en }, 
    'pt-BR': { translation: ptBR }, 
    ja: { translation: ja } 
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
  if (!messages || messages.length === 0) return 'Meow! Time for your reminder.';
  
  // Pick random for now (PRD mentions cycling, which can be implemented with a seed/history later)
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
