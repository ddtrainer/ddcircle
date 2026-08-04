import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useLevel } from '../context/LevelContext';
import { getLevelDef } from '../lib/ddLevel';
import { BREATH_MODES, BREATH_MODE_MULTIPLIER } from '../data/breathPatterns';
import GuideModal from '../components/modals/GuideModal';
import WindIcon from '../components/WindIcon';
import FireIcon from '../components/FireIcon';
import { deviceMotionSupported } from '../hooks/useDeviceMotion';
import styles from './Countdown.module.css';

// 호흡 종목 ↔ 가이드(DEEP_GUIDE) 매핑: 자연1 / 신경안정2 / 멘탈강화3 / 면역력4
const MODE_GUIDE_LEVEL = { '48': 1, '478': 2, '4444': 3, custom: 4 };

// 5 → 4 → 3 → 2 → 1 → GO! 카운트다운
// /countdown/dash 또는 /countdown/deep
// 일시정지/재개 지원 — 사용자가 자세 잡거나 셋업할 시간 필요할 때
export default function Countdown() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { target = 'dash' } = useParams();
  const { selectedExercise, setSelectedExercise, setPreferredExercise, breathPatternId } = useApp();
  const { dashLevel, deepLevel } = useLevel();
  const dashDef = getLevelDef('dash', dashLevel);
  const dashOptions = dashDef.options || [];

  // Deep 가이드는 폐지된 레벨이 아니라 '선택한 호흡'을 따른다 (v2.3 자유선택제).
  const breathMode = BREATH_MODES.find((m) => m.id === breathPatternId) || BREATH_MODES[0];
  const deepGuideLevel = MODE_GUIDE_LEVEL[breathMode.id];
  const deepGuideMode = {
    emoji: breathMode.emoji,
    label: t(breathMode.labelKey),
    multiplier: BREATH_MODE_MULTIPLIER[breathMode.id],
  };
  const [guideOpen, setGuideOpen] = useState(false);
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

  // 현재 레벨에 보유 에셋이 있고, 선택값이 그 레벨 옵션에 없으면 첫 보유 종목으로 보정
  useEffect(() => {
    if (!isDash) return;
    const keys = dashDef.exerciseKeys || [];
    if (keys.length > 0 && !keys.includes(selectedExercise)) {
      setSelectedExercise(keys[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDash, dashLevel]);

  const skip = () => proceed();
  const togglePause = () => {
    if (finishedRef.current) return;
    setPaused((p) => !p);
  };

  return (
    <div className={styles.countdown}>
      <div className={styles.stage}>{t('countdownReady')}</div>
      <div className={styles.next}>
        {isDash
          ? <FireIcon className={styles.fireIcon} />
          : <WindIcon className={styles.windIcon} />}
        <span dangerouslySetInnerHTML={{ __html: t(isDash ? 'countdownDashNext' : 'countdownDeepNext') }} />
      </div>
      <div className={styles.hint}>
        {t(isDash ? 'countdownDashHint' : 'countdownDeepHint')}
      </div>

      {/* Deep 준비 단계에서만 — 선택한 호흡 배지 + 가이드 진입 (실행 화면은 호흡에만 집중) */}
      {!isDash && (
        <button className={styles.levelChip} onClick={() => setGuideOpen(true)}>
          {deepGuideMode.emoji} {deepGuideMode.label} · ×{deepGuideMode.multiplier} EP · 가이드
        </button>
      )}

      {/* Dash 준비 단계에서만 — 레벨 배지 + 가이드 진입 (실행 화면은 운동에만 집중) */}
      {isDash && (
        <button className={styles.levelChip} onClick={() => setGuideOpen(true)}>
          {dashDef.emoji} Lv.{dashLevel} {dashDef.name} · ×{dashDef.multiplier} EP · 가이드
        </button>
      )}

      {/* Dash 준비 단계에서만 — 현재 레벨의 운동 종목 선택 (인라인 변경) */}
      {isDash && dashOptions.length > 0 && (
        <div className={styles.exSelect}>
          <div className={styles.exSelectLabel}>
            {dashDef.emoji} {dashDef.name} · {t('preferLabel')}
          </div>
          <div className={styles.exOptions}>
            {dashOptions.map((opt, i) => {
              const disabled = opt.key == null;
              const active = !disabled && opt.key === selectedExercise;
              return (
                <button
                  key={opt.key ?? `empty-${i}`}
                  type="button"
                  disabled={disabled}
                  className={`${styles.exChip} ${active ? styles.exChipActive : ''} ${disabled ? styles.exChipEmpty : ''}`}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedExercise(opt.key);
                    setPreferredExercise(opt.key);
                  }}
                >
                  {opt.label}
                  {disabled && <span className={styles.exChipSoon}>{t('exComingSoon')}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* [신규·옵션] 전력질주 자동 감지 — Dash Lv.1 + DeviceMotion 지원 기기에서만 노출.
          미노출/미지원이면 기존 흐름 그대로. 기존 로직은 건드리지 않음. */}
      {isDash && dashLevel === 1 && deviceMotionSupported() && (
        <button
          type="button"
          className={styles.sprintEntry}
          onClick={() => navigate('/sprint')}
        >
          ⚡ {t('sprintEntryBtn')}
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

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        track={isDash ? 'dash' : 'deep'}
        level={isDash ? dashLevel : deepGuideLevel}
        mode={isDash ? null : deepGuideMode}
      />
    </div>
  );
}
