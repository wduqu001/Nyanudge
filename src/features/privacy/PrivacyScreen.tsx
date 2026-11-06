import React from 'react';
import { useTranslation } from 'react-i18next';
import { NyaHeader } from '../../shared/components/Header/NyaHeader';
import { PRIVACY_CONTACT_EMAIL, PRIVACY_POLICY_UPDATED } from '../../core/config/privacy';
import styles from './PrivacyScreen.module.css';

const SECTIONS = ['data', 'permissions', 'crash', 'sharing', 'deletion', 'health', 'children'] as const;

export const PrivacyScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const updated = new Date(`${PRIVACY_POLICY_UPDATED}T12:00:00`).toLocaleDateString(i18n.language, { dateStyle: 'long' });

  return (
    <div className={styles.container}>
      <NyaHeader title={t('privacy.title')} />
      <main className={styles.content}>
        <p className={styles.updated}>{t('privacy.updated', { date: updated })}</p>
        <p>{t('privacy.intro')}</p>
        {SECTIONS.map((key) => (
          <section key={key}>
            <h2>{t(`privacy.${key}_title`)}</h2>
            <p>{t(`privacy.${key}_body`)}</p>
          </section>
        ))}
        {PRIVACY_CONTACT_EMAIL && (
          <section>
            <h2>{t('privacy.contact_title')}</h2>
            <p>{t('privacy.contact_body', { email: PRIVACY_CONTACT_EMAIL })}</p>
          </section>
        )}
      </main>
    </div>
  );
};
