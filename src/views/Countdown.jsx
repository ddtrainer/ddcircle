import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { EXERCISES } from '../data/exercises';
import styles from './Countdown.module.css';

// 5 → 4 → 3 → 2 → 1 → GO! 카운트다운
// /countdown/dash 또는 /countdown/deep
// 일시정지/재개 지원 — 사용자가 자세 잡거나 셋업할 시간 필요할 때
export default function Countdown() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { target = 'dash' } = useParams();
  const { preferredExercise } = useApp();
  const currentExercise = EXERCISES.find((e) => e.key === preferredExercise);
  const [count, setCount] = useState(5);
  const [showGo, setShowGo] = useState(false);
  const [paused, setPaused] = useState(false);
  // 같은 숫자 다시 떴을 때도 pop 애니메이션 재생용 키
  const [popKey, setPopKey] = useState(0);
  const finishedRef = useRef(false);
  // 일시정지 → 재개 시 현재 숫자에서 이어가도록 mutable 카운터를 ref로 보관
  const currentRef = useRef(5);
  const intervalRef = useRef(null);

  const isDash = target === 'dash';
  const next = isDash ? '/dash' : '/deep';

  const proceed = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    navigate(next, { replace: true });
  };

  useEffect(() => {
    // 일시정지 중이거나 이미 종료됐으면 인터벌 시작 안 함
    if (paused || finishedRef.current) return;
    intervalRef.current = setInterval(() => {
      currentRef.current -= 1;
      if (currentRef.current > 0) {
        setCount(currentRef.current);
        setPopKey((k) => k + 1);
      } else if (currentRef.current === 0) {
        setShowGo(true);
        setPopKey((k) => k + 1);
      } else {
        clearInterval(intervalRef.current);
        proceed();
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const skip = () => proceed();
  const togglePause = () => {
    if (finishedRef.current) return;
    setPaused((p) => !p);
  };

  return (
    <div className={styles.countdown}>
      <div className={styles.stage}>{t('countdownReady')}</div>
      <div className={`${styles.next} ${isDash ? styles.dashColor : styles.deepColor}`}>
        {t(isDash ? 'countdownDashNext' : 'countdownDeepNext')}
      </div>
      <div className={styles.hint}>
        {t(isDash ? 'countdownDashHint' : 'countdownDeepHint')}
      </div>

      {/* Dash 준비 단계에서만 — 오늘 운동 표시 + 변경 진입로 */}
      {isDash && currentExercise && (
        <button
          type="button"
          className={styles.preferChip}
          onClick={() => {
            // 카운트다운 중단 후 Picker로 돌아감 (다시 선택하면 새 카운트다운 시작)
            finishedRef.current = true;
            navigate('/picker', { replace: true });
          }}
        >
          {t('preferLabel')} <strong>{t('ex' + currentExercise.i18n)}</strong>
          <span className={styles.preferEdit}>{t('preferChange')}</span>
        </button>
      )}

      <button
        type="button"
        className={`${styles.circle} ${isDash ? styles.dashCircle : styles.deepCircle} ${paused ? styles.paused : ''}`}
        onClick={togglePause}
        aria-label={paused ? t('countdownResume') : t('countdownPause')}
      >
        <div className={`${styles.ring} ${isDash ? styles.dashRing : styles.deepRing}`}></div>
        {showGo ? (
          <div key={popKey} className={`${styles.num} ${styles.go}`}>
            {t('countdownGo')}
          </div>
        ) : (
          <div
            key={popKey}
            className={`${styles.num} ${isDash ? styles.dashColor : styles.deepColor}`}
          >
            {count}
          </div>
        )}
        {paused && <div className={styles.pausedBadge}>⏸</div>}
      </button>

      <div className={styles.btnRow}>
        <button className={styles.pauseBtn} onClick={togglePause}>
          {paused ? t('countdownResume') : t('countdownPause')}
        </button>
        <span className={styles.btnDivider}>·</span>
        <button className={styles.skip} onClick={skip}>
          {t('countdownSkip')}
        </button>
      </div>
    </div>
  );
}
