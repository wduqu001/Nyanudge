import React, { useState, useRef, useEffect } from 'react';
import { ChevronIcon, CheckIcon } from '../Icons';
import styles from './Select.module.css';

interface Option {
  value: string | number;
  label: string;
}

interface NyaSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

export const NyaSelect: React.FC<NyaSelectProps> = ({ options, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.activeTrigger : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.label}>{selectedOption?.label}</span>
        <ChevronIcon size={18} rotated={isOpen} className={styles.chevron} />
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <ul className={styles.menu} role="listbox">
            {options.map((option) => (
              <li key={option.value} role="none">
                <button
                  type="button"
                  className={`${styles.item} ${option.value === value ? styles.itemSelected : ''}`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span>{option.label}</span>
                  {option.value === value && <CheckIcon size={16} className={styles.check} />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
