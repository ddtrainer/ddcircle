import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import styles from './HelpFeedbackModal.module.css';

const SUPPORT_EMAIL = 'idosati@gmail.com';

// 도움말 및 피드백 — 문의 메일 안내 + 알아두면 좋은 주요 사항 몇 가지.
export default function HelpFeedbackModal({ open, onClose }) {
  const { t } = useLang();

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.icon}>💬</div>
      <div className={styles.title}>{t('helpFeedbackRowTitle')}</div>
      <p className={styles.intro}>{t('helpFeedbackIntro')}</p>

      <ul className={styles.tips}>
        <li>{t('helpTip1')}</li>
        <li>{t('helpTip2')}</li>
        <li>{t('helpTip3')}</li>
        <li>{t('helpTip4')}</li>
      </ul>

      <a className={styles.primary} href={`mailto:${SUPPORT_EMAIL}`}>
        {t('helpFeedbackEmailBtn')}
      </a>
    </Modal>
  );
}
