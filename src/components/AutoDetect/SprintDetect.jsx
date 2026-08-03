import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useDeviceMotion } from '../../hooks/useDeviceMotion';
import { useSprintCalibration, getCalibratedMinAmp, needsCalibration } from '../../hooks/useSprintCalibration';
import { createSprintDetector, verifySprint } from '../../lib/sprintDetector';
import { saveSprint, processLowIntensityAlternative } from '../../lib/sprintStore';
import { playDashStart, playDashEnd, warmDashAudio } from '../../hooks/useDashSound';
import { SPRINT, isIntroPeriod, intensityPercentile } from '../../data/sprintConfig';
import styles from './SprintDetect.module.css';

// 전력질주 자동 감지 — 신규 기능(기존 흐름과 독립).
// 상태: intro → (calibrate) → grip → countdown → measuring → result
// 폴백: 센서 미지원/권한 거부 → 기존 Dash(운동+셀카) 흐름으로 자동 전환.
export default function SprintDetect() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { user } = useAuth();
  const L = (ko, en) => (lang === 'ko' ? ko : en);

  const { requestPermission, start: motionStart, stop: motionStop } = useDeviceMotion();
  const calib = useSprintCalibration({ start: motionStart, stop: motionStop });

  const [phase, setPhase] = useState('intro'); // intro|calibrate|grip|countdown|measuring|result
  const [showChoice] = useState(() => isIntroPeriod()); // 첫 3일 강도 선택 노출
  const [countdown, setCountdown] = useState(SPRINT.COUNTDOWN_SEC);
  const [liveCount, setLiveCount] = useState(0);
  const [remainSec, setRemainSec] = useState(SPRINT.MEASURE_MS / 1000);
  const [lowSignal, setLowSignal] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [result, setResult] = useState(null);

  const detectorRef = useRef(null);

  // 언마운트 시 리스너 정리 (측정 도중 이탈 = 저장 없이 종료)
  useEffect(() => () => motionStop(), [motionStop]);

  // ── 진입: 권한 요청(반드시 버튼 클릭 콜스택 안) ──
  const handleStart = async () => {
    const res = await requestPermission();
    if (res !== 'granted') { fallbackToSelfie(); return; }
    setPhase(needsCalibration() ? 'calibrate' : 'grip');
  };

  // 센서 미지원/권한 거부 → 기존 Dash(운동 애니메이션 + 셀카 인증) 흐름
  const fallbackToSelfie = () => navigate('/dash', { replace: true });

  // 저강도(걷기) 대체 — 언제든 가능. 걷기 기준 EP는 기존 completeSession(dashFully)이 정산.
  const handleLowIntensity = async () => {
    await processLowIntensityAlternative(user?.id); // is_alternative 기록
    navigate('/dash', { replace: true });           // 걷기 모드(표준 Dash)로 전환
  };

  const startCalibration = async () => {
    setCalibrating(true);
    await calib.runCalibration();
    setCalibrating(false);
    setPhase('grip');
  };

  // ── 카운트다운 3-2-1 ──
  useEffect(() => {
    if (phase !== 'countdown') return;
    setCountdown(SPRINT.COUNTDOWN_SEC);
    let c = SPRINT.COUNTDOWN_SEC;
    const id = setInterval(() => {
      c -= 1;
      if (c <= 0) { clearInterval(id); setPhase('measuring'); }
      else setCountdown(c);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── 1분 측정 ──
  useEffect(() => {
    if (phase !== 'measuring') return;
    const minAmp = getCalibratedMinAmp();
    const det = createSprintDetector({ minAmp, minIntervalMs: SPRINT.MIN_PEAK_INTERVAL_MS });
    detectorRef.current = det;
    setLiveCount(0); setRemainSec(SPRINT.MEASURE_MS / 1000); setLowSignal(false);
    const startTs = performance.now();
    playDashStart(); // 🔊 1분 측정 시작 신호음
    motionStart((x, y, z, ts) => det.addSample(x, y, z, ts));
    const poll = setInterval(() => {
      setLiveCount(det.count);
      const elapsed = performance.now() - startTs;
      setRemainSec(Math.max(0, Math.ceil((SPRINT.MEASURE_MS - elapsed) / 1000)));
      if (elapsed > SPRINT.LOW_SIGNAL_MS && det.count < 3) setLowSignal(true);
      else if (det.count >= 3) setLowSignal(false);
    }, 150);
    const done = setTimeout(() => {
      clearInterval(poll);
      motionStop();
      playDashEnd(); // 🔊 1분 종료 신호음
      const r = det.getResult();
      setResult({ ...r, ...verifySprint(r) });
      setPhase('result');
    }, SPRINT.MEASURE_MS);
    return () => { clearInterval(poll); clearTimeout(done); motionStop(); };
  }, [phase, motionStart, motionStop]);

  // ── 결과 확정 → EP는 기존 completeSession(dashFully)이 정산, sprint 메타는 별도 저장 ──
  const finalize = async () => {
    try { sessionStorage.setItem('ddcircle.session.dashFully', '1'); } catch { /* ignore */ }
    if (result) {
      await saveSprint(user?.id, {
        sprint_count: result.count,
        sprint_intensity: Number(result.avgAmp.toFixed(2)),
        sprint_verified: result.verified,
        is_alternative: false,
      });
    }
    navigate('/complete', { replace: true });
  };

  const privacy = (
    <p className={styles.privacy}>
      🔒 {L('폰의 움직임만 측정하며 위치 정보는 사용하지 않습니다.',
            'We only measure phone motion — no location data is used.')}
    </p>
  );

  const lowIntensityBtn = (
    <button className={styles.lowBtn} onClick={handleLowIntensity}>
      {L('저강도(걷기)로 대체하기', 'Switch to low-intensity (walking)')}
    </button>
  );

  return (
    <div className={styles.screen}>
      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <div className={styles.panel}>
          <div className={styles.badge}>⚡ DASH Lv.1</div>
          <h1 className={styles.title}>{L('전력질주', 'Sprint')}</h1>
          <p className={styles.desc}>
            {L('제자리에서 1분간 빠르게 뛰어요. 폰이 움직임을 자동으로 세어줍니다.',
               'Run in place hard for 1 minute. Your phone counts it automatically.')}
          </p>
          {showChoice && (
            <p className={styles.choiceHint}>
              {L('처음 3일은 강도를 직접 고를 수 있어요.', 'For your first 3 days, you can pick the intensity.')}
            </p>
          )}
          <p className={styles.safety}>
            {L('무리하지 말고 본인 컨디션에 맞게 움직여주세요.',
               'Please move at your own pace — don’t overdo it.')}
          </p>
          <button className={styles.primary} onClick={handleStart}>
            {L('전력질주 시작', 'Start sprint')}
          </button>
          {lowIntensityBtn}
          {privacy}
          <button className={styles.exit} onClick={() => navigate('/countdown/dash', { replace: true })}>
            {L('← 기존 방식으로', '← Back to standard')}
          </button>
        </div>
      )}

      {/* ── CALIBRATION ── */}
      {phase === 'calibrate' && (
        <div className={styles.panel}>
          <h1 className={styles.title}>{L('보정', 'Calibration')}</h1>
          <p className={styles.desc}>
            {L('시작하면 제자리에서 3번 빠르게 뛰어보세요. 나에게 맞는 감도를 자동으로 맞춥니다.',
               'When you start, jump in place 3 times. We’ll tune the sensitivity for you.')}
          </p>
          <div className={styles.big}>{calibrating ? '…' : '🏃'}</div>
          <button className={styles.primary} onClick={startCalibration} disabled={calibrating}>
            {calibrating ? L('측정 중…', 'Measuring…') : L('보정 시작 (3번 뛰기)', 'Start (jump 3×)')}
          </button>
          {lowIntensityBtn}
        </div>
      )}

      {/* ── GRIP ── */}
      {phase === 'grip' && (
        <div className={styles.panel}>
          <h1 className={styles.title}>{L('준비', 'Get ready')}</h1>
          <div className={styles.big}>🤳</div>
          <p className={styles.desc}>
            {L('폰을 손에 꽉 쥐어주세요. 팔을 자연스럽게 흔들며 뛰면 됩니다.',
               'Hold the phone firmly. Swing your arm naturally as you run.')}
          </p>
          <p className={styles.safety}>
            {L('무리하지 말고 본인 컨디션에 맞게 움직여주세요.',
               'Please move at your own pace — don’t overdo it.')}
          </p>
          <button className={styles.primary} onClick={() => { warmDashAudio(); setPhase('countdown'); }}>
            {L('측정 시작', 'Begin')}
          </button>
          {lowIntensityBtn}
        </div>
      )}

      {/* ── COUNTDOWN ── */}
      {phase === 'countdown' && (
        <div className={styles.panel}>
          <div className={styles.countdownNum}>{countdown}</div>
          <p className={styles.desc}>{L('곧 시작합니다!', 'Starting soon!')}</p>
        </div>
      )}

      {/* ── MEASURING ── */}
      {phase === 'measuring' && (
        <div className={styles.panel}>
          <div className={styles.liveCount}>{liveCount}</div>
          <div className={styles.liveLabel}>{L('회', 'reps')}</div>
          <div className={styles.remain}>{L('남은 시간', 'Time left')} {remainSec}s</div>
          {lowSignal && (
            <p className={styles.warn}>
              {L('폰을 좀 더 세게 흔들며 뛰어보세요!', 'Shake harder as you run!')}
            </p>
          )}
          <button className={styles.lowBtn} onClick={handleLowIntensity}>
            {L('힘들면 저강도로 전환', 'Too much? Switch to low-intensity')}
          </button>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === 'result' && result && (
        <div className={styles.panel}>
          <div className={styles.badge}>{L('전력질주 완료', 'Sprint complete')}</div>
          <div className={styles.resultCount}>{result.count}<span>{L('회', 'reps')}</span></div>
          <div className={styles.resultIntensity}>
            {L('강도', 'Intensity')} · {L('상위', 'Top')} {intensityPercentile(result.avgAmp)}%
          </div>
          {!result.verified && (
            <p className={styles.warn}>
              {L('움직임이 불규칙해 신뢰도가 낮아요 (기록은 정상 반영됩니다).',
                 'Motion looked irregular — low confidence (still counted).')}
            </p>
          )}
          <button className={styles.primary} onClick={finalize}>
            {L('완료', 'Done')}
          </button>
        </div>
      )}
    </div>
  );
}
