import { useLang } from '../i18n/LangContext';
import { ENCOURAGEMENTS } from '../data/encouragements';
import styles from './EncourageSheet.module.css';

// 친구에게 보낼 한 줄 응원 메시지 선택 바텀시트
// open, friendName, onSelect(encId), onClose
export default function EncourageSheet({ open, friendName, onSelect, onClose }) {
  const { t } = useLang();
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.title}>
          {t('encSheetTitle').replace('{name}', friendName || '')}
        </div>
        <div className={styles.sub}>{t('encSheetSub')}</div>
        <div className={styles.grid}>
          {ENCOURAGEMENTS.map((e) => (
            <button
              key={e.id}
              className={styles.card}
              onClick={() => onSelect(e.id)}
            >
              <span className={styles.cardEmoji}>{e.emoji}</span>
              <span className={styles.cardText}>{t(e.textKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
