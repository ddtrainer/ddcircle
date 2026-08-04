import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDeviceMotion } from '../../hooks/useDeviceMotion';
import { getCalibratedMinAmp } from '../../hooks/useSprintCalibration';
import { createSprintDetector } from '../../lib/sprintDetector';
import { saveSprint } from '../../lib/sprintStore';
import { SPRINT, intensityPercentile } from '../../data/sprintConfig';
import { getDashMode, DASH_MODES } from '../../data/dashModes';
import { playDashStart, playDashEnd, warmDashAudio } from '../../hooks/useDashSound';
import DigitalTimer from '../DigitalTimer';
import styles from './SprintDetect.module.css';

// Dash 자동측정 — 심플 흐름: intro(시작) → 카운트다운 5~1 → 1분 측정 → 결과 → (선택)셀카 → 완료.
export default function SprintDetect() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { user } = useAuth();
  const { selectedExercise, setSelectedExercise, setPreferredExercise } = useApp();
  const mode = getDashMode(selectedExercise);
  const L = (ko, en) => (lang === 'ko' ? ko : en);
  const modeLabel = L(mode.labelKo, mode.labelEn);

  const { requestPermission, start: motionStart, stop: motionStop } = useDeviceMotion();

  const [phase, setPhase] = useState('intro'); // intro|countdown|measuring|result
  const [countdown, setCountdown] = useState(SPRINT.COUNTDOWN_SEC);
  const [liveCount, setLiveCount] = useState(0);
  const [remainSec, setRemainSec] = useState(SPRINT.MEASURE_MS / 1000);
  const [lowSignal, setLowSignal] = useState(false);
  const [result, setResult] = useState(null);
  const detectorRef = useRef(null);

  useEffect(() => () => motionStop(), [motionStop]);

  // 완료 → dashFully 저장 후 (선택)셀카 화면으로.
  // v2.2: Dash EP는 종목 배율(completeSession)로 계산 — 강도는 화면 표시용일 뿐 EP엔 무관.
  const goProof = (res) => {
    try { sessionStorage.setItem('ddcircle.session.dashFully', '1'); } catch { /* ignore */ }
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

  // '시작' — 권한 요청(제스처 콜스택) 후 바로 카운트다운.
  const handleStart = async () => {
    // 이 종목으로 실제 시작을 확정 → 다음 접속 때 "마지막 선택"으로 재사용.
    // mode.key는 유효 DASH 키(무효값은 getDashMode가 walk로 보정)라 EP/기록도 안전.
    setSelectedExercise(mode.key);
    setPreferredExercise(mode.key);
    warmDashAudio();
    const res = await requestPermission();
    if (res !== 'granted') { goProof(null); return; } // 센서 불가 → 측정 없이 완료(종목 배율로 EP)
    setPhase('countdown');
  };

  useEffect(() => { // 카운트다운 5→1
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

  const finalize = () => goProof(result);

  return (
    <div className={styles.screen}>
      {phase === 'intro' && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} DASH</div>
          <h1 className={styles.title}>{modeLabel}</h1>
          <p className={styles.desc}>
            {L('폰을 손에 꽉 쥐고 1분간 움직이면, 폰이 펄스와 강도를 자동으로 측정해요.',
               'Hold the phone firmly and move for 1 minute — pulses & intensity are measured automatically.')}
          </p>
          <p className={styles.safety}>
            {L('무리하지 말고 본인 컨디션에 맞게 움직여주세요.',
               'Move at your own pace — don’t overdo it.')}
          </p>
          <button className={styles.primary} onClick={handleStart}>{L('시작', 'Start')}</button>
          <button className={styles.exit} onClick={() => navigate('/picker', { replace: true })}>
            {L('← 종목 다시 선택', '← Pick another')}
          </button>
          <p className={styles.privacy}>
            🔒 {L('폰의 움직임만 측정하며 위치 정보는 사용하지 않습니다.',
                  'We only measure phone motion — no location data is used.')}
          </p>
        </div>
      )}

      {phase === 'countdown' && (
        <div className={styles.panel}>
          <div className={styles.countdownNum}>{countdown}</div>
          <p className={styles.desc}>{L('폰을 꽉 쥐고 준비하세요!', 'Hold tight — get ready!')}</p>
        </div>
      )}

      {phase === 'measuring' && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel}</div>
          {/* 큰 디지털 타이머 — 화면의 주인공. 잠깐 시선만 줘도 남은 시간 파악 */}
          <DigitalTimer
            seconds={remainSec}
            label={L('남은 시간', 'Time left')}
            urgent={remainSec <= 10}
          />
          {/* 실시간 횟수는 보조 지표로 아래에 */}
          <div className={styles.repsRow}>
            <span className={styles.repsNum}>{liveCount}</span>
            <span className={styles.repsUnit}>{L('펄스', 'pulses')}</span>
          </div>
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
          <div className={styles.resultCount}>{result.count}<span>{L('펄스', 'pulses')}</span></div>
          <div className={styles.resultIntensity}>
            {L('강도', 'Intensity')} · {L('상위', 'Top')} {intensityPercentile(result.avgAmp, result.count)}%
          </div>
          <button className={styles.primary} onClick={finalize}>{L('완료', 'Done')}</button>
        </div>
      )}
    </div>
  );
}
