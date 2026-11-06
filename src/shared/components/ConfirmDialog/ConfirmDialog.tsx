import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal/Modal';
import { NyaButton } from '../Button/NyaButton';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** In-app replacement for window.confirm: themed, translated, and closed by the Android back button. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, confirmLabel, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <NyaButton variant="secondary" onClick={onCancel}>{t('actions.cancel')}</NyaButton>
        <NyaButton variant="primary" onClick={onConfirm}>{confirmLabel}</NyaButton>
      </div>
    </Modal>
  );
};
