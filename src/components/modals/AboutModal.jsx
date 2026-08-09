import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import styles from './AboutModal.module.css';

// DDCircle 소개 — 브랜드 철학 + 서비스 개요.
export default function AboutModal({ open, onClose }) {
  const { t } = useLang();

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.icon}>📄</div>
      <div className={styles.title}>{t('aboutRowTitle')}</div>

      <p className={styles.paragraph}>{t('aboutParagraph1')}</p>
      <p className={styles.paragraph}>{t('aboutParagraph2')}</p>
      <p className={styles.paragraph}>{t('aboutParagraph3')}</p>
      <p className={styles.paragraph}>{t('aboutParagraph4')}</p>

      <p className={styles.tagline}>{t('aboutTagline')}</p>
    </Modal>
  );
}
