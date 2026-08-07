import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { DASH_MODES } from '../data/dashModes';
import { unlockAudio } from '../utils/audioUnlock';
import { track, Events } from '../utils/analytics';
import styles from './ExercisePicker.module.css';

// Dash 3종 선택 — 걷기 / 슬로우 러닝 / 전력질주.
// 컨디션·환경에 맞게 자유 선택 → 가속도계 자동측정(/sprint)으로.
export default function ExercisePicker() {
  const { lang, t } = useLang();
  const { setSelectedExercise } = useApp();
  const navigate = useNavigate();

  const onSelect = (m) => {
    setSelectedExercise(m.key);
    track(Events.EXERCISE_SELECTED, { exerciseId: m.key });
    unlockAudio(); // iOS 오디오 unlock (제스처 콜스택 안)
    navigate('/sprint');
  };

  return (
    <div className={styles.pickerScreen}>
      <div className={styles.title}>{t('pickMoveTitle')}</div>
      <div className={styles.sub}>
        {t('pickMoveSub')}
      </div>

      <div className={styles.grid}>
        {DASH_MODES.map((m) => (
          <button key={m.key} className={styles.card} onClick={() => onSelect(m)}>
            <div className={styles.preview} style={{ fontSize: 46 }}>{m.emoji}</div>
            <div className={styles.name}>{t(m.labelKey)}</div>
            <div className={styles.desc}>{t(m.descKey)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
