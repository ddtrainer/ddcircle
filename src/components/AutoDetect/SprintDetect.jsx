import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDeviceMotion } from '../../hooks/useDeviceMotion';
import { useSprintCalibration, getCalibratedMinAmp, needsCalibration } from '../../hooks/useSprintCalibration';
import { createSprintDetector } from '../../lib/sprintDetector';
import { saveSprint } from '../../lib/sprintStore';
import { SPRINT, intensityPercentile, intensityToEp } from '../../data/sprintConfig';
import { getDashMode } from '../../data/dashModes';
import { playDashStart, playDashEnd, warmDashAudio } from '../../hooks/useDashSound';
import styles from './SprintDetect.module.css';

// Dash 자동측정 — 선택 종목(걷기/슬로우런/전력질주)을 가속도계로 1분 측정.
// 흐름: intro → (보정) → 그립 → 3초 → 측정 → 결과 → (선택)셀카(/proof) → 완료(EP는 강도 비례).
export default function SprintDetect() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { user } = useAuth();
  const { selectedExercise } = useApp();
  const mode = getDashMode(selectedExercise);
  const L = (ko, en) => (lang === 'ko' ? ko : en);
  const modeLabel = L(mode.labelKo, mode.labelEn);

  const { requestPermission, start: motionStart, stop: motionStop } = useDeviceMotion();
  const calib = useSprintCalibration({ start: motionStart, stop: motionStop });

  const [phase, setPhase] = useState('intro'); // intro|calibrate|grip|countdown|measuring|result
  const [countdown, setCountdown] = useState(SPRINT.COUNTDOWN_SEC);
  const [liveCount, setLiveCount] = useState(0);
  const [remainSec, setRemainSec] = useState(SPRINT.MEASURE_MS / 1000);
  const [lowSignal, setLowSignal] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [result, setResult] = useState(null);
  const detectorRef = useRef(null);

  useEffect(() => () => motionStop(), [motionStop]);

  // 완료 → dashFully + 강도비례 기준 EP 저장 후 (선택)셀카 화면으로.
  const goProof = (baseEp, res) => {
    try {
      sessionStorage.setItem('ddcircle.session.dashFully', '1');
      sessionStorage.setItem('ddcircle.session.dashBaseEp', String(baseEp));
    } catch { /* ignore */ }
    if (res) {
      saveSprint(user?.id, {
        sprint_count: res.count,
        sprint_intensity: Number(res.avgAmp.toFixed(2)),
        sprint_verified: true,
        is_alternative: mode.key === 'walk',
      });
    }
    navigate('/proof', { replace: true });
  };

  const handleStart = async () => {
    warmDashAudio();
    const res = await requestPermission();
    if (res !== 'granted') { goProof(7, null); return; } // 센서 불가 → 걷기 기준 EP + 셀카
    setPhase(needsCalibration() ? 'calibrate' : 'grip');
  };

  const startCalibration = async () => {
    setCalibrating(true);
    await calib.runCalibration();
    setCalibrating(false);
    setPhase('grip');
  };

  useEffect(() => { // 카운트다운
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

  useEffect(() => { // 1분 측정
    if (phase !== 'measuring') return;
    const minAmp = getCalibratedMinAmp();
    const det = createSprintDetector({ minAmp, minIntervalMs: SPRINT.MIN_PEAK_INTERVAL_MS });
    detectorRef.current = det;
    setLiveCount(0); setRemainSec(SPRINT.MEASURE_MS / 1000); setLowSignal(false);
    const startTs = performance.now();
    playDashStart(); // 🔊 시작음
    motionStart((x, y, z, ts) => det.addSample(x, y, z, ts));
    const poll = setInterval(() => {
      setLiveCount(det.count);
      const el = performance.now() - startTs;
      setRemainSec(Math.max(0, Math.ceil((SPRINT.MEASURE_MS - el) / 1000)));
      if (el > SPRINT.LOW_SIGNAL_MS && det.count < 3) setLowSignal(true);
      else if (det.count >= 3) setLowSignal(false);
    }, 150);
    const done = setTimeout(() => {
      clearInterval(poll); motionStop(); playDashEnd(); // 🔊 종료음
      setResult(det.getResult());
      setPhase('result');
    }, SPRINT.MEASURE_MS);
    return () => { clearInterval(poll); clearTimeout(done); motionStop(); };
  }, [phase, motionStart, motionStop]);

  const finalize = () => {
    const pct = result ? intensityPercentile(result.avgAmp, result.count) : 90;
    goProof(intensityToEp(pct), result);
  };

  const privacy = (
    <p className={styles.privacy}>
      🔒 {L('폰의 움직임만 측정하며 위치 정보는 사용하지 않습니다.',
            'We only measure phone motion — no location data is used.')}
    </p>
  );

  return (
    <div className={styles.screen}>
      {phase === 'intro' && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} DASH</div>
          <h1 className={styles.title}>{modeLabel}</h1>
          <p className={styles.desc}>
            {L('1분간 움직이면 폰이 횟수와 강도를 자동으로 측정해요.',
               'Move for 1 minute — your phone auto-measures reps & intensity.')}
          </p>
          <p className={styles.safety}>
            {L('무리하지 말고 본인 컨디션에 맞게 움직여주세요.',
               'Move at your own pace — don’t overdo it.')}
          </p>
          <button className={styles.primary} onClick={handleStart}>{L('시작', 'Start')}</button>
          <button className={styles.exit} onClick={() => navigate('/picker', { replace: true })}>
            {L('← 종목 다시 선택', '← Pick another')}
          </button>
          {privacy}
        </div>
      )}

      {phase === 'calibrate' && (
        <div className={styles.panel}>
          <h1 className={styles.title}>{L('보정', 'Calibration')}</h1>
          <p className={styles.desc}>
            {L('시작하면 제자리에서 3번 빠르게 뛰어보세요. 나에게 맞는 감도를 맞춥니다.',
               'When you start, jump in place 3 times to tune sensitivity.')}
          </p>
          <div className={styles.big}>{calibrating ? '…' : '🏃'}</div>
          <button className={styles.primary} onClick={startCalibration} disabled={calibrating}>
            {calibrating ? L('측정 중…', 'Measuring…') : L('보정 시작 (3번 뛰기)', 'Start (jump 3×)')}
          </button>
        </div>
      )}

      {phase === 'grip' && (
        <div className={styles.panel}>
          <h1 className={styles.title}>{L('준비', 'Get ready')}</h1>
          <div className={styles.big}>🤳</div>
          <p className={styles.desc}>
            {L('폰을 손에 꽉 쥐어주세요. 팔을 자연스럽게 흔들며 움직이면 됩니다.',
               'Hold the phone firmly. Swing your arm naturally as you move.')}
          </p>
          <p className={styles.safety}>
            {L('무리하지 말고 본인 컨디션에 맞게 움직여주세요.',
               'Move at your own pace — don’t overdo it.')}
          </p>
          <button className={styles.primary} onClick={() => { warmDashAudio(); setPhase('countdown'); }}>
            {L('측정 시작', 'Begin')}
          </button>
        </div>
      )}

      {phase === 'countdown' && (
        <div className={styles.panel}>
          <div className={styles.countdownNum}>{countdown}</div>
          <p className={styles.desc}>{L('곧 시작합니다!', 'Starting soon!')}</p>
        </div>
      )}

      {phase === 'measuring' && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel}</div>
          <div className={styles.liveCount}>{liveCount}</div>
          <div className={styles.liveLabel}>{L('회', 'reps')}</div>
          <div className={styles.remain}>{L('남은 시간', 'Time left')} {remainSec}s</div>
          {lowSignal && (
            <p className={styles.warn}>
              {L('폰을 좀 더 세게 흔들며 움직여보세요!', 'Move a bit harder!')}
            </p>
          )}
        </div>
      )}

      {phase === 'result' && result && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel} {L('완료', 'done')}</div>
          <div className={styles.resultCount}>{result.count}<span>{L('회', 'reps')}</span></div>
          <div className={styles.resultIntensity}>
            {L('강도', 'Intensity')} · {L('상위', 'Top')} {intensityPercentile(result.avgAmp, result.count)}%
          </div>
          <button className={styles.primary} onClick={finalize}>{L('완료', 'Done')}</button>
        </div>
      )}
    </div>
  );
}
