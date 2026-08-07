import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDeviceMotion } from '../../hooks/useDeviceMotion';
import { getCalibratedMinAmp } from '../../hooks/useSprintCalibration';
import { createSprintDetector } from '../../lib/sprintDetector';
import { startCameraMotion, energyToSample } from '../../lib/cameraMotion';
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

// DDCircle 고유 단위 — 일반 '펄스(pulse)'로 오해되지 않도록 브랜드 용어를 쓴다.
const DPULSE = 'DPulses';

// Dash 자동측정 — 심플 흐름: intro(시작) → 카운트다운 5~1 → 1분 측정 → 결과 → (선택)셀카 → 완료.
export default function SprintDetect() {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { user } = useAuth();
  const { selectedExercise, setSelectedExercise, setPreferredExercise } = useApp();
  const mode = getDashMode(selectedExercise);
  const modeLabel = t(mode.labelKey);

  const { requestPermission, start: motionStart, stop: motionStop } = useDeviceMotion();

  const [phase, setPhase] = useState('intro'); // intro|countdown|measuring|result
  const [countdown, setCountdown] = useState(SPRINT.COUNTDOWN_SEC);
  const [liveCount, setLiveCount] = useState(0);
  const [remainSec, setRemainSec] = useState(SPRINT.MEASURE_MS / 1000);
  const [lowSignal, setLowSignal] = useState(false);
  const [noSensor, setNoSensor] = useState(false); // 측정 중 원시 센서 이벤트가 0 → 센서 접근 차단 추정
  const [sensorBlocked, setSensorBlocked] = useState(false); // 측정 종료 시점 확정 판정
  const [result, setResult] = useState(null);
  const [useCamera, setUseCamera] = useState(false); // 동작센서가 막힌 환경에서 카메라로 대체 측정
  const detectorRef = useRef(null);
  const rawSamplesRef = useRef(0);
  const camStopRef = useRef(null);

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

  // '시작' 하나로 끝 — 환경에 맞는 측정 수단을 알아서 고른다.
  //   · 동작센서가 막힌 환경(Pi Browser의 iframe) → 카메라로 대체 측정
  //   · 그 외 → 기존 동작센서
  // 어느 쪽이든 실패하면 막지 않고 시간 기반으로 완료시킨다.
  const handleStart = async () => {
    // 이 종목으로 실제 시작을 확정 → 다음 접속 때 "마지막 선택"으로 재사용.
    // mode.key는 유효 DASH 키(무효값은 getDashMode가 walk로 보정)라 EP/기록도 안전.
    setSelectedExercise(mode.key);
    setPreferredExercise(mode.key);
    warmDashAudio();

    if (inIframe) {
      // 카메라 권한은 제스처 콜스택 안에서 요청해야 팝업이 뜬다.
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        s.getTracks().forEach((t) => t.stop()); // 권한 확인용 — 실제 스트림은 측정 시작 시 다시 연다
        setUseCamera(true);
      } catch {
        setUseCamera(false); // 거부/불가 → 측정 없이 1분 운동으로 완료
      }
      setPhase('countdown');
      return;
    }

    setUseCamera(false);
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
    // 카메라 모드는 프레임 차이(0~255)라 단위가 달라 전용 floor를 쓴다.
    const minAmp = useCamera ? SPRINT.CAMERA_MIN_AMP : getCalibratedMinAmp();
    const det = createSprintDetector({ minAmp, minIntervalMs: SPRINT.MIN_PEAK_INTERVAL_MS });
    detectorRef.current = det;
    setLiveCount(0); setRemainSec(SPRINT.MEASURE_MS / 1000); setLowSignal(false);
    setNoSensor(false); rawSamplesRef.current = 0;
    const startTs = performance.now();
    playDashStart(); // 🔊 시작음
    // 원시 이벤트 카운트는 감지 알고리즘과 무관 — det.addSample 입력/로직은 그대로.
    let cancelled = false; // 클로저의 phase는 낡은 값이라 쓸 수 없다 — 로컬 플래그로 판단
    if (useCamera) {
      // 카메라 프레임 차이를 동일 detector에 흘려보냄(피크 감지·리듬 게이트 그대로 재사용)
      startCameraMotion((energy, ts) => {
        rawSamplesRef.current += 1;
        const [x, y, z] = energyToSample(energy);
        det.addSample(x, y, z, ts);
      })
        .then((stop) => {
          if (cancelled) stop();          // 이미 끝났으면 즉시 해제(카메라 켜진 채 방치 방지)
          else camStopRef.current = stop;
        })
        .catch(() => { /* 스트림 열기 실패 → 이벤트 0 → 시간 기반 완료로 이어짐 */ });
    } else {
      motionStart((x, y, z, ts) => { rawSamplesRef.current += 1; det.addSample(x, y, z, ts); });
    }
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
    const stopCam = () => {
      cancelled = true; // 아직 promise가 안 끝났어도 resolve 시점에 즉시 해제되도록
      if (camStopRef.current) { camStopRef.current(); camStopRef.current = null; }
    };
    const done = setTimeout(() => {
      clearInterval(poll); motionStop(); stopCam(); playDashEnd(); // 🔊 종료음 + 카메라 해제
      // 원시 센서 이벤트가 사실상 없었다면 '측정 불가 환경'(Pi Browser의 iframe 등).
      // 사용자가 안 움직인 게 아니므로 실패 처리하지 않고 시간 기반 완료로 인정한다.
      setSensorBlocked(rawSamplesRef.current < SENSOR_ALIVE_MIN_TOTAL);
      setResult(det.getResult());
      setPhase('result');
    }, SPRINT.MEASURE_MS);
    // 이탈/재렌더 시에도 카메라를 반드시 해제 — 뒤따르는 셀카 화면이 카메라를 열 수 있어야 함
    return () => { clearInterval(poll); clearTimeout(done); motionStop(); stopCam(); };
  }, [phase, useCamera, motionStart, motionStop]);

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
            {t('dashIntroDesc')}
          </p>
          <p className={styles.safety}>
            {t('dashSafetyPace')}
          </p>

          {/* iframe(Pi Browser) 안에서는 동작센서가 차단됨 → 카메라 흔들림으로 대체 측정.
              선택지를 주지 않고 '시작' 하나로 진행하되, 카메라를 왜 쓰는지 미리 알린다. */}
          {inIframe && (
            <p className={styles.safety}>
              {t('dashCameraNotice')}
            </p>
          )}

          <button className={styles.primary} onClick={handleStart}>{t('startBtn')}</button>
          <button className={styles.exit} onClick={() => navigate('/picker', { replace: true })}>
            {t('pickAnotherMove')}
          </button>
          <p className={styles.privacy}>
            🔒 {t('dashPrivacyNote')}
          </p>
        </div>
      )}

      {phase === 'countdown' && (
        <div className={styles.panel}>
          <div className={styles.countdownNum}>{countdown}</div>
          <p className={styles.desc}>
            {useCamera
              ? t('dashReadyCamera')
              : t('dashReady')}
          </p>
        </div>
      )}

      {phase === 'measuring' && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel}</div>
          {/* 큰 디지털 타이머 — 화면의 주인공. 잠깐 시선만 줘도 남은 시간 파악 */}
          <DigitalTimer
            seconds={remainSec}
            label={t('timeLeft')}
            urgent={remainSec <= 10}
          />
          {/* 실시간 횟수는 보조 지표로 아래에 */}
          <div className={styles.repsRow}>
            <span className={styles.repsNum}>{liveCount}</span>
            <span className={styles.repsUnit}>{DPULSE}</span>
          </div>
          {useCamera && (
            <p className={styles.camBadge}>
              {t('dashMeasuringCamera')}
            </p>
          )}
          {(noSensor || lowSignal) && (
            <p className={styles.warn}>
              {noSensor
                ? (useCamera
                    ? t('dashNoCameraSignal')
                    : t('dashNoSensorHint'))
                : t('dashMoveHarder')}
            </p>
          )}
        </div>
      )}

      {phase === 'result' && result && passed && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel} {t('doneLower')}</div>
          <div className={styles.resultCount}>{result.count}<span>{DPULSE}</span></div>
          <div className={styles.resultIntensity}>
            {t('intensity')} · {t('topPercent')} {intensityPercentile(result.avgAmp, result.count)}%
          </div>
          <button className={styles.primary} onClick={finalize}>{t('doneBtn')}</button>
        </div>
      )}

      {/* 센서 차단 환경(Pi Browser 등) — 펄스를 잴 방법이 없으므로 시간 기반으로 완료 인정.
          사용자 잘못이 아니라서 실패로 막지 않는다. */}
      {phase === 'result' && result && sensorBlocked && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel} {t('doneLower')}</div>
          <div className={styles.resultTime}>1:00</div>
          <p className={styles.desc}>
            {t('dashBlockedResult')}
          </p>
          <button className={styles.primary} onClick={() => goProof(null)}>{t('doneBtn')}</button>
        </div>
      )}

      {/* 움직임이 너무 적음 — 완료 불가, 재측정 유도(다음 응원 화면으로 넘어가지 않음) */}
      {phase === 'result' && result && !passed && !sensorBlocked && (
        <div className={styles.panel}>
          <div className={styles.badge}>{mode.emoji} {modeLabel}</div>
          <div className={styles.resultCountFail}>{result.count}<span>{DPULSE}</span></div>
          <p className={styles.warn}>
            {t('dashTooLittle', { n: SPRINT.MIN_VALID_COUNT })}
          </p>
          <button className={styles.primary} onClick={retry}>{t('measureAgain')}</button>
          <button className={styles.exit} onClick={() => navigate('/picker', { replace: true })}>
            {t('pickAnotherMove')}
          </button>
        </div>
      )}
    </div>
  );
}
