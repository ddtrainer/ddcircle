import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useBreathCycle } from '../hooks/useBreathCycle';
import { useBreathSound } from '../hooks/useBreathSound';
import { BREATH_PRESETS, resolveBreathPattern } from '../data/breathPatterns';
import ProgressDots from '../components/ProgressDots';
import BreathSettingsModal from '../components/modals/BreathSettingsModal';
import { track, Events } from '../utils/analytics';
import styles from './DeepSession.module.css';

export default function DeepSession() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { breathPatternId, setBreathPatternId, customBreath } = useApp();
  const [soundOn, setSoundOn] = useState(true);
  const [soundReady, setSoundReady] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    setSoundReady(false);
    const id = setTimeout(() => setSoundReady(true), 1500);
    return () => clearTimeout(id);
  }, [breathPatternId]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 현재 적용된 호흡 설정
  const pattern = useMemo(
    () => resolveBreathPattern(breathPatternId, customBreath),
    [breathPatternId, customBreath]
  );

  // skip vs 자연 종료 구분 — 전체 사이클 완주만 Deep EP 인정
  const skipClickedRef = useRef(false);

  const { phase, displaySecond, cycle, totalLeft, paused, togglePause, skip: cycleSkip } = useBreathCycle({
    durations: pattern.durations,
    totalCycles: pattern.cycles,
    enabled: soundReady,
    onComplete: () => {
      const fully = !skipClickedRef.current;
      try { sessionStorage.setItem('ddcircle.session.deepFully', fully ? '1' : '0'); } catch {}
      track(Events.DEEP_COMPLETED, { patternId: breathPatternId, fully });
      setTimeout(() => navigate('/complete', { replace: true }), 600);
    },
  });

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

  // phase 전환 시 효과음 (durations 동적)
  useBreathSound({ phase, enabled: soundOn && !paused && soundReady, durations: pattern.durations });

  const minutes = Math.floor(totalLeft / 60);
  const seconds = totalLeft % 60;
  const totalText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const guideKey =
    phase === 'inhale' ? 'breathInhale' :
    phase === 'hold' ? 'breathHold' :
    phase === 'postHold' ? 'breathPostHold' :
    'breathExhale';

  const displayNum = displaySecond > 0 ? displaySecond : '';

  // 패턴 선택 핸들러
  const selectPattern = (id) => {
    if (id === 'custom') {
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
      <ProgressDots step={3} total={4} />
      <div className={styles.stage}>STEP 3 OF 4</div>
      <div className={`${styles.title} ${styles.deepColor}`}>🧘 Deep</div>
      <div
        className={styles.desc}
        dangerouslySetInnerHTML={{ __html: t('deepDesc') }}
      />

      {/* 호흡 패턴 선택 */}
      <div className={styles.patternPicker}>
        {BREATH_PRESETS.map((p) => (
          <button
            key={p.id}
            className={`${styles.patternBtn} ${breathPatternId === p.id ? styles.patternActive : ''}`}
            onClick={() => selectPattern(p.id)}
          >
            {t('breath' + p.id)}
          </button>
        ))}
        <button
          className={`${styles.patternBtn} ${breathPatternId === 'custom' ? styles.patternActive : ''}`}
          onClick={() => selectPattern('custom')}
        >
          ⚙ {t('breathCustom')}
          {breathPatternId === 'custom' && (
            <span className={styles.patternMeta}>
              {' '}{customBreath.inhale}-{customBreath.hold}-{customBreath.exhale}-{customBreath.postHold ?? 0}
            </span>
          )}
        </button>
      </div>

      {/* 단계 인디케이터 (숫자 표시) */}
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

      {/* 호흡 orb */}
      <div className={styles.breathZone}>
        <div
          ref={orbRef}
          className={`${styles.orbOuter} ${animationReady && soundReady ? styles[phase] : ''}`}
          style={{
            '--inhale-dur': `${pattern.durations.inhale}s`,
            '--exhale-dur': `${pattern.durations.exhale}s`,
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
        <div className={styles.cycleLabel}>
          <span className={styles.cycleNum}>{cycle}</span>
          <span>{t('cycleOf').replace(/\d+/, pattern.cycles)}</span>
        </div>
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

      <BreathSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
