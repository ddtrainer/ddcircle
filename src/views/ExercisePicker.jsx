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
  const { lang } = useLang();
  const { setSelectedExercise } = useApp();
  const navigate = useNavigate();
  const L = (ko, en) => (lang === 'ko' ? ko : en);

  const onSelect = (m) => {
    setSelectedExercise(m.key);
    track(Events.EXERCISE_SELECTED, { exerciseId: m.key });
    unlockAudio(); // iOS 오디오 unlock (제스처 콜스택 안)
    navigate('/sprint');
  };

  return (
    <div className={styles.pickerScreen}>
      <div className={styles.title}>{L('오늘의 운동을 골라요', "Pick today's move")}</div>
      <div className={styles.sub}>
        {L('컨디션·환경에 맞게 선택하세요. 폰이 자동으로 측정해요.',
           'Choose what fits you — your phone measures it automatically.')}
      </div>

      <div className={styles.grid}>
        {DASH_MODES.map((m) => (
          <button key={m.key} className={styles.card} onClick={() => onSelect(m)}>
            <div className={styles.preview} style={{ fontSize: 46 }}>{m.emoji}</div>
            <div className={styles.name}>{L(m.labelKo, m.labelEn)}</div>
            <div className={styles.desc}>{L(m.descKo, m.descEn)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
