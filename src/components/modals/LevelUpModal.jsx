import { getLevelDef } from '../../lib/ddLevel';
import Modal from './Modal';
import styles from './LevelUpModal.module.css';

// 레벨업 축하 모달. track: 'deep' | 'dash', level: 새로 도달한 레벨.
// safetyRequired 레벨(Lv.4)이면 안전 안내 확인 버튼을 강조한다.
const TRACK_LABEL = { deep: 'Deep · 호흡', dash: 'Dash · 운동' };

export default function LevelUpModal({ open, onClose, track, level }) {
  const def = getLevelDef(track, level);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.body}>
        <div className={styles.badge}>{def.emoji}</div>
        <div className={styles.tag}>LEVEL UP · {TRACK_LABEL[track]}</div>
        <div className={styles.title}>
          Lv.{level} {def.name}
        </div>
        <div className={styles.method}>{def.method}</div>
        <div className={styles.multiplier}>EP 배율 ×{def.multiplier}</div>

        {def.safetyRequired && (
          <div className={styles.safety}>
            ⚠️ 강도가 높은 단계예요. 가이드의 안전 안내를 꼭 확인하세요.
          </div>
        )}

        <button className={styles.primaryBtn} onClick={onClose}>
          확인
        </button>
      </div>
    </Modal>
  );
}
