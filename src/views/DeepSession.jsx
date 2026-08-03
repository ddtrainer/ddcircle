import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useLevel } from '../context/LevelContext';
import { useBreathCycle } from '../hooks/useBreathCycle';
import { useWimHofCycle } from '../hooks/useWimHofCycle';
import { useBreathSound, playBellIn, playBellOut, playHoldChime } from '../hooks/useBreathSound';
import { BREATH_PRESETS, resolveBreathPattern, buildWimHofScript } from '../data/breathPatterns';
import { getLevelDef, DEEP_LEVELS } from '../lib/ddLevel';
import ProgressDots from '../components/ProgressDots';
import WindIcon from '../components/WindIcon';
import BreathSettingsModal from '../components/modals/BreathSettingsModal';
import { useToast } from '../components/Toast';
import { track, Events } from '../utils/analytics';
import styles from './DeepSession.module.css';

// breathId → 해당 호흡이 열리는 DD 레벨. 현재 레벨 이하만 선택 가능, 그 위는 잠금.
const BREATH_REQUIRED_LEVEL = Object.fromEntries(
  DEEP_LEVELS.map((l) => [l.breathId, l.level])
);

export default function DeepSession() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { breathPatternId, setBreathPatternId, customBreath, naturalBreath, wimHofRounds, wimHofCycles, wimHofRetention, wimHofRecovery, wimHofFinish, preferredExercise, setSelectedExercise } = useApp();
  const isWim = breathPatternId === 'custom';
  const { deepLevel } = useLevel();
  const deepDef = getLevelDef('deep', deepLevel);
  const toast = useToast();

  // 현재 레벨보다 높은 단계의 호흡인지 (잠금 여부)
  const isLocked = (id) => (BREATH_REQUIRED_LEVEL[id] ?? 1) > deepLevel;

  // 저장된 선택이 현재 레벨에서 잠긴 호흡이면 현재 레벨 기본 호흡으로 보정
  // (잠긴 패턴이 실제로 재생되는 것을 방지)
  useEffect(() => {
    if (isLocked(breathPatternId)) {
      setBreathPatternId(deepDef.breathId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLevel, breathPatternId]);
  const [soundOn, setSoundOn] = useState(true);
  const [soundReady, setSoundReady] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    setSoundReady(false);
    const id = setTimeout(() => setSoundReady(true), 1500);
    return () => clearTimeout(id);
  }, [breathPatternId]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState('custom');

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
    // Deep 종료 후 → 항상 Dash 3종 선택 화면(/picker). 컨디션·환경 따라 매번 선택.
    setTimeout(() => {
      navigate('/picker', { replace: true });
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
      el.style.transform = 'scale(0.4)';
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

  const minutes = Math.floor(totalLeft / 60);
  const seconds = totalLeft % 60;
  const totalText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // 윔호프: 현재 step의 들숨/날숨 길이로 orb transition 동적 설정
  const orbInhaleDur = isWim ? (phase === 'inhale' ? wimEngine.duration : pattern.durations.inhale) : pattern.durations.inhale;
  const orbExhaleDur = isWim ? (phase === 'exhale' ? wimEngine.duration : pattern.durations.exhale) : pattern.durations.exhale;

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

  // 패턴 선택 핸들러
  const selectPattern = (id) => {
    if (isLocked(id)) {
      const reqLevel = BREATH_REQUIRED_LEVEL[id] ?? 1;
      toast.show('🔒', t('breathLockedNotice').replace('{lv}', reqLevel));
      return;
    }
    if (id === 'custom') {
      // 윔호프 호흡 — 선택과 동시에 횟수 조절 모달 열기
      setBreathPatternId('custom');
      setSettingsMode('wimhof');
      setSettingsOpen(true);
    } else if (id === '48') {
      // 자연 호흡 — 선택과 동시에 조절 모달 열기 (기존 자율 호흡 UI 재사용)
      setBreathPatternId('48');
      setSettingsMode('natural');
      setSettingsOpen(true);
    } else {
      setBreathPatternId(id);
    }
  };

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

      {/* 호흡 패턴 선택 */}
      <div className={styles.patternPicker}>
        {BREATH_PRESETS.map((p) => {
          const locked = isLocked(p.id);
          return (
            <button
              key={p.id}
              className={`${styles.patternBtn} ${breathPatternId === p.id ? styles.patternActive : ''} ${deepDef.breathId === p.id ? styles.levelMatch : ''} ${locked ? styles.locked : ''}`}
              onClick={() => selectPattern(p.id)}
              aria-disabled={locked}
            >
              {locked && <span className={styles.lockEmoji}>🔒</span>}
              {!locked && deepDef.breathId === p.id && <span className={styles.levelMatchEmoji}>{deepDef.emoji}</span>}
              {!locked && p.id === '48' && '⚙ '}
              {t('breath' + p.id)}
              {!locked && p.id === '48' && breathPatternId === '48' && (
                <span className={styles.patternMeta}>
                  {' '}{naturalBreath.inhale}-{naturalBreath.exhale}
                </span>
              )}
            </button>
          );
        })}
        {(() => {
          const locked = isLocked('custom');
          return (
            <button
              className={`${styles.patternBtn} ${breathPatternId === 'custom' ? styles.patternActive : ''} ${deepDef.breathId === 'custom' ? styles.levelMatch : ''} ${locked ? styles.locked : ''}`}
              onClick={() => selectPattern('custom')}
              aria-disabled={locked}
            >
              {locked ? <span className={styles.lockEmoji}>🔒</span>
                : deepDef.breathId === 'custom' && <span className={styles.levelMatchEmoji}>{deepDef.emoji}</span>}
              {!locked && '⚙ '}{t('breathCustom')}
            </button>
          );
        })()}
      </div>

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

      {/* 호흡 orb */}
      <div className={styles.breathZone}>
        <div
          ref={orbRef}
          className={`${styles.orbOuter} ${animationReady && soundReady ? styles[phase] : ''}`}
          style={{
            '--inhale-dur': `${orbInhaleDur}s`,
            '--exhale-dur': `${orbExhaleDur}s`,
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
        <div className={styles.totalTime}>
          <span>{t('timeLeftLabel')}</span> <span>{totalText}</span>
        </div>
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

      <BreathSettingsModal open={settingsOpen} mode={settingsMode} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
