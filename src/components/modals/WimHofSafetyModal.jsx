import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import styles from './WimHofSafetyModal.module.css';

// 윔호프(면역력 강화) 호흡 최초 선택 시 안전 동의 게이트.
// "확인했습니다" 동의해야 진입 가능. 문구는 기존 가이드 안전 안내와 동일.
export default function WimHofSafetyModal({ open, onClose, onConfirm }) {
  const { lang, t } = useLang();

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.wrap}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>
          {t('wimSafetyTitle')}
        </h2>
        <p className={styles.body}>
          {t('wimSafetyBody')}
        </p>
        <button className={styles.confirm} onClick={onConfirm}>
          {t('wimSafetyOk')}
        </button>
        <button className={styles.cancel} onClick={onClose}>
          {t('pickAnotherBreath')}
        </button>
      </div>
    </Modal>
  );
}
