import { useLang } from '../i18n/LangContext';
import styles from './SetAlertModal.module.css';

// 셋 시간 도달 시 자동으로 표시되는 알림 모달
// slot: { id, name, icon }, onStart: 시작 콜백, onLater: 나중에
export default function SetAlertModal({ open, slot, onStart, onLater }) {
  const { t } = useLang();
  if (!open || !slot) return null;

  return (
    <div className={styles.overlay} onClick={onLater}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>{slot.icon}</div>
        <div className={styles.title}>
          {t('setAlertTitle')}
        </div>
        <div className={styles.sub}>{t('setAlertSub')}</div>
        <button className={styles.startBtn} onClick={onStart}>
          {t('setAlertStart')}
        </button>
        <button className={styles.laterBtn} onClick={onLater}>
          {t('setAlertLater')}
        </button>
      </div>
    </div>
  );
}
