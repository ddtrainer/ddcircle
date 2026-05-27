import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { EXERCISES } from '../data/exercises';
import { unlockAudio } from '../utils/audioUnlock';
import { track, Events } from '../utils/analytics';
import ExerciseSVG from '../components/ExerciseSVG';
import styles from './ExercisePicker.module.css';

export default function ExercisePicker() {
  const { t } = useLang();
  const { setSelectedExercise } = useApp();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState(null);

  const onSelect = (key) => {
    setSelectedKey(key);
    setSelectedExercise(key);
    track(Events.EXERCISE_SELECTED, { exerciseId: key });
    // iOS 오디오 unlock — 사용자 제스처 콜스택 안에서 호출해야 효과 있음
    unlockAudio();
    // 신규 순서: Deep(호흡) → Dash(운동) → Proof(셀카) → Complete
    // 운동 전 호흡으로 진입 저항 ↓ & 호흡 품질 ↑
    setTimeout(() => navigate('/countdown/deep'), 300);
  };

  return (
    <div className={styles.pickerScreen}>
      <div className={styles.title}>{t('pickerTitle')}</div>
      <div className={styles.sub}>{t('pickerSub')}</div>

      <div className={styles.grid}>
        {EXERCISES.map((ex) => (
          <button
            key={ex.key}
            className={`${styles.card} ${selectedKey === ex.key ? styles.selected : ''}`}
            onClick={() => onSelect(ex.key)}
          >
            <div className={styles.preview}>
              <ExerciseSVG type={ex.key} size={60} />
            </div>
            <div className={styles.name}>{t('ex' + ex.i18n)}</div>
            <div className={styles.desc}>{t('ex' + ex.i18n + 'Desc')}</div>
          </button>
        ))}
      </div>

      <button className={styles.back} onClick={() => navigate('/')}>
        {t('pickerBack')}
      </button>
    </div>
  );
}
