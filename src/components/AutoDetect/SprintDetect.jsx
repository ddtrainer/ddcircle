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

  const { permission, requestPermission, start: motionStart, stop: motionStop } = useDeviceMotion();

  const [phase, setPhase] = useState('intro'); // intro|countdown|measuring|result
  const [countdown, setCountdown] = useState(SPRINT.COUNTDOWN_SEC);
  const [liveCount, setLiveCount] = useState(0);
  const [remainSec, setRemainSec] = useState(SPRINT.MEASURE_MS / 1000);
  const [lowSignal, setLowSignal] = useState(false);
  const [noSensor, setNoSensor] = useState(false); // 측정 중 원시 센서 이벤트가 0 → 센서 접근 차단 추정
  const [rawSamples, setRawSamples] = useState(0);  // 원시 devicemotion 이벤트 수(진단용)
  const [result, setResult] = useState(null);
  const detectorRef = useRef(null);
  const rawSamplesRef = useRef(0);

  // 환경 진단 — Pi Browser 등에서 센서가 왜 막히는지 한 줄로 파악(스크린샷 1장으로 원인 확인).
  const inIframe = (() => { try { return window.top !== window.self; } catch { return true; } })();
  const hasDM = typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined';
  const needsPerm = hasDM && typeof DeviceMotionEvent.requestPermission === 'function';

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
    setNoSensor(false); setRawSamples(0); rawSamplesRef.current = 0;
    const startTs = performance.now();
    playDashStart(); // 🔊 시작음
    // 원시 이벤트 카운트는 감지 알고리즘과 무관 — det.addSample 입력/로직은 그대로.
    motionStart((x, y, z, ts) => { rawSamplesRef.current += 1; det.addSample(x, y, z, ts); });
    const poll = setInterval(() => {
      setLiveCount(det.count);
      setRawSamples(rawSamplesRef.current);
      const el = performance.now() - startTs;
      setRemainSec(Math.max(0, Math.ceil((SPRINT.MEASURE_MS - el) / 1000)));
      // 센서 신호 자체가 안 들어오면(원시 이벤트 0) '더 세게'가 아니라 '센서 차단'으로 안내.
      if (el > 2500 && rawSamplesRef.current === 0) setNoSensor(true);
      else if (rawSamplesRef.current > 0) setNoSensor(false);
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

  // iframe 탈출 — 사용자 탭(제스처) 안에서만 최상위 이동이 허용된다.
  // (로드 시점 자동 탈출은 브라우저가 anti-framebusting으로 차단함)
  // 실패 시 새 창으로 폴백.
  const openTopLevel = () => {
    const sep = window.location.search ? '&' : '?';
    const url = window.location.href + sep + 'fb=1';
    try {
      window.top.location = url;
    } catch {
      window.open(url, '_blank', 'noopener');
    }
  };

  // 움직임이 너무 적으면(펄스 < 최소 유효치) 완료로 인정하지 않고 재측정.
  // 측정 로직(피크 감지)은 그대로, 결과 게이트만 추가.
  const passed = !!result && result.count >= SPRINT.MIN_VALID_COUNT;
  const retry = () => {
    setResult(null);
    setLiveCount(0);
    setLowSignal(false);
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

          {/* iframe(Pi Browser 등) 안에서는 동작센서가 차단됨 — 시작 전에 미리 안내.
              1분 낭비 없이 탭 한 번으로 최상위에서 다시 열도록. */}
          {inIframe && (
            <>
              <p className={styles.warn}>
                {L('지금 화면에서는 동작 센서가 차단돼 펄스가 측정되지 않아요. 전체화면으로 열면 정상 측정됩니다.',
                   'Motion sensors are blocked in this view, so pulses can’t be measured. Open full screen to fix it.')}
              </p>
              <button className={styles.primary} onClick={openTopLevel}>
                {L('전체화면으로 열기', 'Open full screen')}
              </button>
            </>
          )}

          <button
            className={inIframe ? styles.lowBtn : styles.primary}
            onClick={handleStart}
          >
            {inIframe ? L('그래도 시작', 'Start anyway') : L('시작', 'Start')}
          </button>
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
            <>
              <p className={styles.warn}>
                {noSensor
                  ? L('동작 센서 신호가 잡히지 않아요. 이 브라우저에서 센서 접근이 제한된 것 같아요.',
                      'No motion-sensor signal. Sensor access seems blocked in this browser.')
                  : L('폰을 좀 더 세게 흔들며 움직여보세요!', 'Move a bit harder!')}
              </p>
              {/* 센서가 막힌 원인이 iframe이면 — 탭 한 번으로 전체화면(최상위)에서 다시 열기 */}
              {noSensor && inIframe && (
                <button className={styles.primary} onClick={openTopLevel}>
                  {L('전체화면으로 열어 센서 켜기', 'Open full screen to enable sensor')}
                </button>
              )}
              {/* 센서가 아예 안 잡히는 예외 상황에서만 진단 노출 — 단순히 천천히 움직이는
                  사용자에게는 보이지 않게. (raw=0 센서 차단 / raw>0인데 cnt=0 데이터 이상) */}
              {noSensor && (
                <p className={styles.diag}>
                  DM:{hasDM ? 'Y' : 'N'} · perm:{permission} · reqPerm:{needsPerm ? 'Y' : 'N'} · iframe:{inIframe ? 'Y' : 'N'} · raw:{rawSamples} · cnt:{liveCount}
                </p>
              )}
            </>
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

      {/* 움직임이 너무 적음 — 완료 불가, 재측정 유도(다음 응원 화면으로 넘어가지 않음) */}
      {phase === 'result' && result && !passed && (
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
