import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useBreathCycle } from '../hooks/useBreathCycle';
import { useWimHofCycle } from '../hooks/useWimHofCycle';
import { useBreathSound, playBellIn, playBellOut, playHoldChime } from '../hooks/useBreathSound';
import { resolveBreathPattern, buildWimHofScript } from '../data/breathPatterns';
import { DASH_MODES } from '../data/dashModes';
import ProgressDots from '../components/ProgressDots';
import WindIcon from '../components/WindIcon';
import { track, Events } from '../utils/analytics';
import styles from './DeepSession.module.css';

export default function DeepSession() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { breathPatternId, customBreath, naturalBreath, wimHofRounds, wimHofCycles, wimHofRetention, wimHofRecovery, wimHofFinish, preferredExercise, setSelectedExercise } = useApp();
  const isWim = breathPatternId === 'custom';

  // v2.3: Deep 호흡 잠금 폐지 — 선택은 BreathPicker(자유선택)에서. DeepSession은 선택된 호흡을 재생만.
  const [soundOn, setSoundOn] = useState(true);
  const [soundReady, setSoundReady] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    setSoundReady(false);
    const id = setTimeout(() => setSoundReady(true), 1500);
    return () => clearTimeout(id);
  }, [breathPatternId]);

  // 현재 적용된 호흡 설정
  const pattern = useMemo(
    () => resolveBreathPattern(breathPatternId, customBreath, naturalBreath),
    [breathPatternId, customBreath, naturalBreath]
  );

  // skip vs 자연 종료 구분 — 전체 사이클 완주만 Deep EP 인정
  const skipClickedRef = useRef(false);

  const handleComplete = () => {
    const fully = !skipClickedRef.current;
    try { sessionStorage.setItem('ddcircle.session.deepFully', fully ? '1' : '0'); } catch {}
    track(Events.DEEP_COMPLETED, { patternId: breathPatternId, fully });
    // Deep 종료 후 → Dash. 마지막에 고른 종목(preferredExercise)이 유효하면 선택 화면을
    // 건너뛰고 SprintDetect intro로 직행(그 화면이 "이 종목으로 시작 / 다른 종목 선택"을 겸함).
    // 아직 한 번도 고른 적 없는(기본 'jog') 첫 사용자는 기존대로 /picker로.
    const hasRemembered = DASH_MODES.some((m) => m.key === preferredExercise);
    const nextPath = hasRemembered ? '/sprint' : '/picker';
    if (hasRemembered) setSelectedExercise(preferredExercise);
    setTimeout(() => {
      navigate(nextPath, { replace: true });
    }, 600);
  };

  // 균일 사이클 엔진 (4-7-8 / 박스 / 자연 호흡)
  const cycleEngine = useBreathCycle({
    durations: pattern.durations,
    totalCycles: pattern.cycles,
    enabled: soundReady && !isWim,
    onComplete: handleComplete,
  });

  // 윔호프 스크립트 엔진 (과호흡 → 참기 → 회복)
  const wimScript = useMemo(() => buildWimHofScript(wimHofRounds, wimHofCycles, wimHofRetention, wimHofRecovery, wimHofFinish), [wimHofRounds, wimHofCycles, wimHofRetention, wimHofRecovery, wimHofFinish]);
  const wimEngine = useWimHofCycle({
    script: wimScript,
    enabled: soundReady && isWim,
    onComplete: handleComplete,
  });

  const engine = isWim ? wimEngine : cycleEngine;
  const { phase, displaySecond, totalLeft, paused, togglePause, skip: cycleSkip } = engine;
  const cycle = isWim ? undefined : cycleEngine.cycle;
  const wimStage = isWim ? wimEngine.stage : null;

  const skip = () => {
    skipClickedRef.current = true;
    cycleSkip();
  };

  // 마운트 후 애니메이션 활성화 + 시작 이벤트
  useEffect(() => {
    track(Events.DEEP_STARTED, { patternId: breathPatternId });
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimationReady(true));
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // soundReady=false 구간(딜레이 대기): orb를 즉시 작은 상태로 고정
  // soundReady=true: inline style 해제 → CSS phase 클래스가 transition 시작
  const orbRef = useRef(null);
  useEffect(() => {
    const el = orbRef.current;
    if (!el) return;
    if (!soundReady) {
      el.style.transition = 'none';
      el.style.transform = 'scale(0.3)';
    } else {
      el.style.transition = '';
      el.style.transform = '';
    }
  }, [soundReady]);

  // 일시정지 시 진행 중인 transition을 현재 위치에서 고정
  useEffect(() => {
    const el = orbRef.current;
    if (!el) return;
    if (paused) {
      const t = getComputedStyle(el).transform;
      el.style.transform = t === 'none' ? '' : t;
      el.style.transition = 'none';
    } else {
      el.style.transform = '';
      el.style.transition = '';
    }
  }, [paused]);

  // 배경음 + phase 효과음 — 윔호프는 phase 벨을 끄고(bells:false) stage 기반으로 직접 신호
  const soundEnabled = soundOn && !paused && soundReady;
  useBreathSound({ phase, enabled: soundEnabled, bells: !isWim, durations: pattern.durations });

  // 윔호프 stage 전환 신호음 (사이클당 stage 진입 시점에 1회)
  //   과호흡 시작 → 들숨 벨 1회 / 숨 참기 시작 → 멈춤 차임
  //   회복 호흡 시작 → 들숨 벨 / 마무리 날숨 시작 → 날숨 벨
  const lastWimSigRef = useRef(null);
  useEffect(() => {
    if (!isWim || !soundEnabled) { lastWimSigRef.current = null; return; }
    const sig = `${wimEngine.cycle}:${wimStage}`;
    if (sig === lastWimSigRef.current) return;
    lastWimSigRef.current = sig;
    if (wimStage === 'power' || wimStage === 'recovery') playBellIn();
    else if (wimStage === 'retention') playHoldChime();
    else if (wimStage === 'finish') playBellOut();
  }, [isWim, soundEnabled, wimStage, wimEngine.cycle]);


  // 윔호프: 현재 step의 들숨/날숨 길이로 orb transition 동적 설정
  const orbInhaleDur = isWim ? (phase === 'inhale' ? wimEngine.duration : pattern.durations.inhale) : pattern.durations.inhale;
  const orbExhaleDur = isWim ? (phase === 'exhale' ? wimEngine.duration : pattern.durations.exhale) : pattern.durations.exhale;
  // 과호흡 구간 — 빠른 펌핑(현재 step 길이 = 1초)에 색/움직임 전환을 동기화해 부드럽게
  const isPower = isWim && wimStage === 'power';
  const orbPowerDur = isPower ? wimEngine.duration : 1;

  // 가이드 메시지 — 윔호프는 stage+phase 기반
  let guideKey;
  if (isWim) {
    if (wimStage === 'power') guideKey = 'wimHofPowerGuide';
    else if (wimStage === 'retention') guideKey = 'wimHofRetentionGuide';
    else if (wimStage === 'finish') guideKey = 'wimHofFinishGuide';
    else if (phase === 'inhale') guideKey = 'wimHofRecoveryInhaleGuide';
    else guideKey = 'wimHofRecoveryHoldGuide';
  } else {
    guideKey =
      phase === 'inhale' ? 'breathInhale' :
      phase === 'hold' ? 'breathHold' :
      phase === 'postHold' ? 'breathPostHold' :
      'breathExhale';
  }

  const displayNum = displaySecond > 0 ? displaySecond : '';

  // hold/postHold가 0이면 칩 숨김
  const showHold = pattern.durations.hold > 0;
  const showPostHold = (pattern.durations.postHold || 0) > 0;

  return (
    <div className={styles.session}>
      <ProgressDots step={1} total={4} />
      <div className={styles.stage}>STEP 1 OF 4</div>
      <div className={styles.title}>
        <WindIcon className={styles.windIcon} />
        <span dangerouslySetInnerHTML={{ __html: t('deepSessionTitle') }} />
      </div>

      {/* v2.3: 호흡 선택은 BreathPicker(앞 화면)로 이전 — 여기선 선택된 호흡을 바로 재생 */}

      {/* 단계 인디케이터 (숫자 표시) */}
      {isWim ? (
        <div className={styles.pattern}>
          <div className={`${styles.patternStep} ${styles.inhale} ${wimStage === 'power' ? styles.active : ''}`}>
            {t('wimHofPower')}
          </div>
          <div className={`${styles.patternStep} ${styles.hold} ${wimStage === 'retention' ? styles.active : ''}`}>
            {t('wimHofRetention')}
          </div>
          <div className={`${styles.patternStep} ${styles.exhale} ${wimStage === 'recovery' || wimStage === 'finish' ? styles.active : ''}`}>
            {t('wimHofRecovery')}
          </div>
        </div>
      ) : (
        <div className={styles.pattern}>
          <div className={`${styles.patternStep} ${styles.inhale} ${phase === 'inhale' ? styles.active : ''}`}>
            {t('patternInhale').replace(/\d+/, pattern.durations.inhale)}
          </div>
          {showHold && (
            <div className={`${styles.patternStep} ${styles.hold} ${phase === 'hold' ? styles.active : ''}`}>
              {t('patternHold').replace(/\d+/, pattern.durations.hold)}
            </div>
          )}
          <div className={`${styles.patternStep} ${styles.exhale} ${phase === 'exhale' ? styles.active : ''}`}>
            {t('patternExhale').replace(/\d+/, pattern.durations.exhale)}
          </div>
          {showPostHold && (
            <div className={`${styles.patternStep} ${styles.hold} ${phase === 'postHold' ? styles.active : ''}`}>
              {t('patternPostHold').replace(/\d+/, pattern.durations.postHold)}
            </div>
          )}
        </div>
      )}

      {/* 호흡 orb — 호흡 사이클(수축/팽창)에 시선이 집중되도록 orb만 남김 */}
      <div className={styles.breathZone}>
        <div
          ref={orbRef}
          className={`${styles.orbOuter} ${animationReady && soundReady ? styles[phase] : ''} ${isPower ? styles.power : ''}`}
          style={{
            '--inhale-dur': `${orbInhaleDur}s`,
            '--exhale-dur': `${orbExhaleDur}s`,
            '--power-dur': `${orbPowerDur}s`,
          }}
        >
          <div className={styles.orbInner}>{displayNum}</div>
        </div>
      </div>

      {/* 가이드 메시지 */}
      <div className={`${styles.guide} ${styles[`guide_${phase}`]}`}>
        {t(guideKey)}
      </div>

      {/* 사이클 카운터 + 남은 시간 */}
      <div className={styles.counterRow}>
        {isWim ? (
          <div className={styles.cycleLabel}>
            {wimStage === 'power' ? (
              <>
                <span className={styles.cycleNum}>{wimEngine.round}</span>
                <span>{t('wimHofRoundLabel').replace('{cur}', '').replace('{tot}', wimEngine.totalRounds)}</span>
              </>
            ) : (
              <span>{t(wimStage === 'retention' ? 'wimHofRetention' : wimStage === 'finish' ? 'wimHofFinish' : 'wimHofRecovery')}</span>
            )}
            {wimEngine.totalCycles > 1 && (
              <span className={styles.cycleSuffix}>
                {' · '}{t('wimHofCycleOf').replace('{cur}', wimEngine.cycle).replace('{tot}', wimEngine.totalCycles)}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.cycleLabel}>
            <span className={styles.cycleNum}>{cycle}</span>
            <span>{t('cycleOf').replace(/\d+/, pattern.cycles)}</span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={togglePause}>
          {paused ? t('resume') : t('pause')}
        </button>
        <button
          className={`${styles.ctrlBtn} ${styles.soundBtn}`}
          onClick={() => setSoundOn((v) => !v)}
          aria-label="Sound toggle"
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button className={`${styles.ctrlBtn} ${styles.skipBtn}`} onClick={skip}>
          {t('skip')}
        </button>
      </div>
    </div>
  );
}
