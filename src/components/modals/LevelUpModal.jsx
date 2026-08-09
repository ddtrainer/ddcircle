import { useLang } from '../../i18n/LangContext';
import { getLevelDef } from '../../lib/ddLevel';
import Modal from './Modal';
import styles from './LevelUpModal.module.css';

// 레벨업 축하 모달. track: 'deep' | 'dash', level: 새로 도달한 레벨.
// safetyRequired 레벨(Lv.4)이면 안전 안내 확인 버튼을 강조한다.
const TRACK_LABEL_KEY = { deep: 'levelUpTrackDeep', dash: 'levelUpTrackDash' };

export default function LevelUpModal({ open, onClose, track, level }) {
  const { t } = useLang();
  const def = getLevelDef(track, level);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.body}>
        <div className={styles.badge}>{def.emoji}</div>
        <div className={styles.tag}>LEVEL UP · {t(TRACK_LABEL_KEY[track])}</div>
        <div className={styles.title}>
          Lv.{level} {t(def.nameKey)}
        </div>
        <div className={styles.method}>{t(def.methodKey)}</div>
        <div className={styles.multiplier}>{t('levelUpEpMultiplier', { x: def.multiplier })}</div>

        {def.safetyRequired && (
          <div className={styles.safety}>
            {t('levelUpSafetyNotice')}
          </div>
        )}

        <button className={styles.primaryBtn} onClick={onClose}>
          {t('levelUpConfirmBtn')}
        </button>
      </div>
    </Modal>
  );
}
