import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Character } from '../../../types/nyanudge';
import styles from './CharacterSelect.module.css';

interface CharacterSelectProps {
  value: Character;
  onChange: (value: Character) => void;
  className?: string;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ value, onChange, className = '' }) => {
  const { t } = useTranslation();
  const characters: Character[] = ['mochi', 'sora', 'kuro'];

  const getEmoji = (char: Character) => {
    switch (char) {
      case 'mochi': return '🐱';
      case 'sora': return '🐈';
      case 'kuro': return '🐈‍⬛';
      default: return '🐱';
    }
  };

  return (
    <div className={`${styles.grid} ${className}`}>
      {characters.map((char) => (
        <button
          key={char}
          type="button"
          className={`${styles.option} ${value === char ? styles.active : ''}`}
          onClick={() => onChange(char)}
          aria-pressed={value === char}
          aria-label={t(`settings.appearance.char_${char}`)}
        >
          <div className={styles.icon}>
            {getEmoji(char)}
          </div>
          <div className={styles.name}>
            {t(`settings.appearance.char_${char}`)}
          </div>
        </button>
      ))}
    </div>
  );
};
