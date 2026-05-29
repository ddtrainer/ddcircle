import { useEffect, useRef, useState } from 'react';
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

// HIIT 미니(Lv.4) 임시 구현 — 전용 에셋이 없어 기존 영상 3종을 20초씩 연속 재생.
//   0~20초: 버피 / 20~40초: 마운틴 클라이머 / 40~60초: 점핑잭
// seconds는 60→0 카운트다운이므로 남은 시간 기준으로 구간을 나눈다.
function hiitSegment(seconds) {
  if (seconds > 40) return 'burpee';
  if (seconds > 20) return 'mountain-climber';
  return 'jumping-jack';
}

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
    const keys = { 40: 'dashGuide40', 20: 'dashGuide20', 10: 'dashGuide10', 5: 'dashGuide5' };
    const key = keys[sec];
    if (!key) return;
    setGuideVisible(false);
    setTimeout(() => {
      setGuide(t(key));
      setGuideVisible(true);
    }, 200);
  };

  // skip vs 자연 종료 구분 — EP 정책에 사용 (60초 완주해야만 Dash EP 인정)
  // skipClickedRef는 onComplete가 호출되는 두 경로(타이머 0초 도달 / skip 버튼)
  // 중 어느 쪽인지 판별. true면 skip, false면 자연 종료.
  const skipClickedRef = useRef(false);

  const { seconds, paused, togglePause, skip: timerSkip } = useDashTimer({
    initial: TOTAL,
    onComplete: () => {
      const fully = !skipClickedRef.current;
      try { sessionStorage.setItem('ddcircle.session.dashFully', fully ? '1' : '0'); } catch {}
      playDashEnd();
      track(Events.DASH_COMPLETED, { exercise: selectedExercise, fully });
      setTimeout(() => navigate('/proof', { replace: true }), 900);
    },
    onMilestone: handleMilestone,
  });

  const skip = () => {
    skipClickedRef.current = true;
    timerSkip();
  };

  const ringOffset = RING_CIRCUMFERENCE * (1 - seconds / TOTAL);
  const isHiit = selectedExercise === 'hiit';
  const displayExercise = isHiit ? hiitSegment(seconds) : selectedExercise;
  const exerciseI18n = EXERCISES.find((e) => e.key === displayExercise)?.i18n || 'JumpingJack';
  const exerciseName = t(`ex${exerciseI18n}`);
  const desc = t('dashExNameTpl', { ex: exerciseName });

  return (
    <div className={styles.session}>
      <ProgressDots step={2} total={4} />
      <div className={styles.stage}>STEP 2 OF 4</div>
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
            <ExerciseSVG type={displayExercise} size={130} paused={paused} />
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
