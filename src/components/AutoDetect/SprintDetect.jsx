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

// 센서가 '살아있다'고 볼 최소 원시 이벤트 수. 정상 가속도계는 ~60Hz라 1분에 수천 개가 들어온다.
// 이보다 적으면 신호가 없는 것(차단된 환경)으로 보고, 사용자를 실패 처리하지 않는다.
const SENSOR_ALIVE_MIN_EARLY = 10;  // 측정 2.5초 시점
const SENSOR_ALIVE_MIN_TOTAL = 60;  // 1분 측정 전체

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
  const [noSensor, setNoSensor] = useState(false); // 측정 중 원시 센서 이벤트가 0 → 센서 접근 차단 추정
  const [sensorBlocked, setSensorBlocked] = useState(false); // 측정 종료 시점 확정 판정
  const [result, setResult] = useState(null);
  const detectorRef = useRef(null);
  const rawSamplesRef = useRef(0);

  // Pi Browser는 앱을 cross-origin iframe으로 감싸며, 그 안에서는 동작센서가 차단된다.
  // (최상위로 탈출하면 센서는 살지만 Pi SDK 컨텍스트를 잃어 로그인/결제가 끊김 → 탈출하지 않음)
  const inIframe = (() => { try { return window.top !== window.self; } catch { return true; } })();

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
    setNoSensor(false); rawSamplesRef.current = 0;
    const startTs = performance.now();
    playDashStart(); // 🔊 시작음
    // 원시 이벤트 카운트는 감지 알고리즘과 무관 — det.addSample 입력/로직은 그대로.
    motionStart((x, y, z, ts) => { rawSamplesRef.current += 1; det.addSample(x, y, z, ts); });
    const poll = setInterval(() => {
      setLiveCount(det.count);
      const el = performance.now() - startTs;
      setRemainSec(Math.max(0, Math.ceil((SPRINT.MEASURE_MS - el) / 1000)));
      // 센서 신호 자체가 안 들어오면 '더 세게'가 아니라 '센서 차단'으로 안내.
      // 정상 가속도계는 ~60Hz(2.5초에 100+개)라, 한 자릿수면 사실상 신호 없음.
      if (el > 2500 && rawSamplesRef.current < SENSOR_ALIVE_MIN_EARLY) setNoSensor(true);
      else if (rawSamplesRef.current >= SENSOR_ALIVE_MIN_EARLY) setNoSensor(false);
      if (el > SPRINT.LOW_SIGNAL_MS && det.count < 3) setLowSignal(true);
      else if (det.count >= 3) setLowSignal(false);
    }, 150);
    const done = setTimeout(() => {
      clearInterval(poll); motionStop(); playDashEnd(); // 🔊 종료음
      // 원시 센서 이벤트가 사실상 없었다면 '측정 불가 환경'(Pi Browser의 iframe 등).
      // 사용자가 안 움직인 게 아니므로 실패 처리하지 않고 시간 기반 완료로 인정한다.
      setSensorBlocked(rawSamplesRef.current < SENSOR_ALIVE_MIN_TOTAL);
      setResult(det.getResult());
      setPhase('result');
    }, SPRINT.MEASURE_MS);
    return () => { clearInterval(poll); clearTimeout(done); motionStop(); };
  }, [phase, motionStart, motionStop]);

  const finalize = () => goProof(result);


  // 움직임이 너무 적으면(펄스 < 최소 유효치) 완료로 인정하지 않고 재측정.
  // 단, 센서가 아예 차단된 환경(펄스를 측정할 방법이 없음)은 사용자 잘못이 아니므로
  // 이 게이트를 적용하지 않는다 — 시간 기반으로 완료 인정.
  // 측정 로직(피크 감지)은 그대로, 결과 게이트만 추가.
  const passed = !!result && !sensorBlocked && result.count >= SPRINT.MIN_VALID_COUNT;
  const retry = () => {
    setResult(null);
    setLiveCount(0);
    setLowSignal(false);
    setSensorBlocked(false);
    setPhase('countdown');
  };

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

          {/* iframe(Pi Browser) 안에서는 동작센서가 차단됨 — 펄스 없이 시간으로 완료된다고 미리 안내.
              전체화면 탈출은 Pi 로그인이 끊기므로 권하지 않는다. */}
          {inIframe && (
            <p className={styles.safety}>
              {L('ℹ️ 이 환경에서는 펄스 측정 없이 1분 운동으로 완료돼요.',
                 'ℹ️ Here the session completes on time — pulses aren’t measured.')}
            </p>
          )}

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
          {(noSensor || lowSignal) && (
            <p className={styles.warn}>
              {noSensor
                ? L('이 환경에서는 펄스 측정이 안 돼요. 시간으로 완료되니 그대로 움직여주세요!',
                    'Pulses can’t be measured here — keep moving, it completes on time.')
                : L('폰을 좀 더 세게 흔들며 움직여보세요!', 'Move a bit harder!')}
            </p>
          )}
        </div>
      )}

      {phase === 'result' && result && passed && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel} {L('완료', 'done')}</div>
          <div className={styles.resultCount}>{result.count}<span>{L('펄스', 'pulses')}</span></div>
          <div className={styles.resultIntensity}>
            {L('강도', 'Intensity')} · {L('상위', 'Top')} {intensityPercentile(result.avgAmp, result.count)}%
          </div>
          <button className={styles.primary} onClick={finalize}>{L('완료', 'Done')}</button>
        </div>
      )}

      {/* 센서 차단 환경(Pi Browser 등) — 펄스를 잴 방법이 없으므로 시간 기반으로 완료 인정.
          사용자 잘못이 아니라서 실패로 막지 않는다. */}
      {phase === 'result' && result && sensorBlocked && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel} {L('완료', 'done')}</div>
          <div className={styles.resultTime}>1:00</div>
          <p className={styles.desc}>
            {L('이 환경에서는 동작 센서를 쓸 수 없어 펄스는 기록되지 않았어요. 1분 운동은 완료로 인정됩니다.',
               'Motion sensors aren’t available here, so pulses weren’t recorded. Your 1-minute session still counts.')}
          </p>
          <button className={styles.primary} onClick={() => goProof(null)}>{L('완료', 'Done')}</button>
        </div>
      )}

      {/* 움직임이 너무 적음 — 완료 불가, 재측정 유도(다음 응원 화면으로 넘어가지 않음) */}
      {phase === 'result' && result && !passed && !sensorBlocked && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel}</div>
          <div className={styles.resultCountFail}>{result.count}<span>{L('펄스', 'pulses')}</span></div>
          <p className={styles.warn}>
            {L(`움직임이 거의 감지되지 않았어요. 폰을 손에 꽉 쥐고 1분간 움직여야 완료돼요. (최소 ${SPRINT.MIN_VALID_COUNT} 펄스)`,
               `Almost no movement detected. Hold the phone firmly and move for a full minute to complete. (min ${SPRINT.MIN_VALID_COUNT} pulses)`)}
          </p>
          <button className={styles.primary} onClick={retry}>{L('다시 측정', 'Measure again')}</button>
          <button className={styles.exit} onClick={() => navigate('/picker', { replace: true })}>
            {L('← 종목 다시 선택', '← Pick another')}
          </button>
        </div>
      )}
    </div>
  );
}
