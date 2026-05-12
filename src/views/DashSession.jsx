import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { EXERCISES } from '../data/exercises';
import { useDashTimer } from '../hooks/useDashTimer';
import { playDashStart, playDashEnd } from '../hooks/useDashSound';
import { track, Events } from '../utils/analytics';
import ProgressDots from '../components/ProgressDots';
import ExerciseSVG from '../components/ExerciseSVG';
import styles from './DashSession.module.css';

const TOTAL = 60;
const RING_CIRCUMFERENCE = 351.86; // 2 * π * 56

export default function DashSession() {
  const { t } = useLang();
  const { selectedExercise } = useApp();
  const navigate = useNavigate();
  const [guide, setGuide] = useState('');
  const [guideVisible, setGuideVisible] = useState(true);

  // 시작 시 가이드 메시지 + 시작 효과음
  useEffect(() => {
    setGuide(t('dashGuideStart'));
    playDashStart();
    track(Events.DASH_STARTED, { exercise: selectedExercise });
  }, [t, selectedExercise]);

  // 마일스톤별 가이드 변경 (페이드 효과)
  const handleMilestone = (sec) => {
    const keys = { 55: 'dashGuide55', 40: 'dashGuide40', 20: 'dashGuide20', 10: 'dashGuide10', 5: 'dashGuide5' };
    const key = keys[sec];
    if (!key) return;
    setGuideVisible(false);
    setTimeout(() => {
      setGuide(t(key));
      setGuideVisible(true);
    }, 200);
  };

  const { seconds, paused, togglePause, skip } = useDashTimer({
    initial: TOTAL,
    onComplete: () => {
      playDashEnd();
      track(Events.DASH_COMPLETED, { exercise: selectedExercise });
      // 0.9초 후 Proof로 (효과음이 끝까지 들리도록 약간 지연)
      setTimeout(() => navigate('/proof', { replace: true }), 900);
    },
    onMilestone: handleMilestone,
  });

  const ringOffset = RING_CIRCUMFERENCE * (1 - seconds / TOTAL);
  const exerciseI18n = EXERCISES.find((e) => e.key === selectedExercise)?.i18n || 'JumpingJack';
  const exerciseName = t(`ex${exerciseI18n}`);
  const desc = t('dashExNameTpl', { ex: exerciseName });

  return (
    <div className={styles.session}>
      <ProgressDots step={1} total={4} />
      <div className={styles.stage}>STEP 1 OF 4</div>
      <div className={`${styles.title} ${styles.dashColor}`}>🔥 Dash</div>
      <div className={styles.desc}>{desc}</div>

      <div className={styles.exerciseZone}>
        <div className={styles.timerRingOuter}>
          <svg viewBox="0 0 120 120">
            <circle className={styles.ringBg} cx="60" cy="60" r="56" />
            <circle
              className={`${styles.ringProgress} ${styles.dashRing}`}
              cx="60" cy="60" r="56"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
        </div>
        <div className={styles.exerciseAnim}>
          <div className={styles.exerciseSvgContainer}>
            <ExerciseSVG type={selectedExercise} size={130} paused={paused} />
          </div>
        </div>
      </div>

      <div className={styles.counter}>
        <span>{seconds}</span>
        <span className={styles.unit}>{t('secondsUnit')}</span>
      </div>

      <div className={styles.guide} style={{ opacity: guideVisible ? 1 : 0 }}>
        {guide}
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={togglePause}>
          {paused ? t('resume') : t('pause')}
        </button>
        <button className={`${styles.ctrlBtn} ${styles.skip}`} onClick={skip}>
          {t('skip')}
        </button>
      </div>
    </div>
  );
}
