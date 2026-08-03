import { useCallback, useState } from 'react';
import { SPRINT, SPRINT_KEYS } from '../data/sprintConfig';
import { createSprintDetector } from '../lib/sprintDetector';

// 저장된 개인 진폭 floor 조회 (없으면 기본값)
export function getCalibratedMinAmp() {
  try {
    const v = parseFloat(localStorage.getItem(SPRINT_KEYS.threshold));
    return Number.isFinite(v) && v > 0 ? v : SPRINT.DEFAULT_MIN_AMP;
  } catch {
    return SPRINT.DEFAULT_MIN_AMP;
  }
}

// 캘리브레이션 필요 여부 (한 번도 안 했으면 필요)
export function needsCalibration() {
  try {
    return !localStorage.getItem(SPRINT_KEYS.threshold);
  } catch {
    return true;
  }
}

// "3번 빠르게 뛰어보세요" — 진폭 샘플을 모아 개인 floor 산출.
// floor = 감지된 진폭 중앙값 × 0.3 (정지 잡음은 거르되, 가벼운 움직임도 잡히게).
// [2.5, 5] 클램프. start/stop 은 useDeviceMotion 것을 주입(권한은 이미 획득 상태).
export function useSprintCalibration({ start, stop }) {
  const [status, setStatus] = useState('idle'); // idle|running|done
  const [minAmp, setMinAmp] = useState(getCalibratedMinAmp);

  const runCalibration = useCallback((durationMs = SPRINT.CALIB_MS) => {
    return new Promise((resolve) => {
      setStatus('running');
      const det = createSprintDetector({
        minAmp: SPRINT.CALIB_CAPTURE_MIN_AMP,
        minIntervalMs: SPRINT.MIN_PEAK_INTERVAL_MS,
      });
      start((x, y, z, ts) => det.addSample(x, y, z, ts));
      setTimeout(() => {
        stop();
        const { peakAmps } = det.getResult();
        let amp = SPRINT.DEFAULT_MIN_AMP;
        if (peakAmps.length >= 2) {
          const sorted = [...peakAmps].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          amp = Math.min(5, Math.max(2.5, median * 0.3));
        }
        try { localStorage.setItem(SPRINT_KEYS.threshold, String(amp)); } catch { /* ignore */ }
        setMinAmp(amp);
        setStatus('done');
        resolve(amp);
      }, durationMs);
    });
  }, [start, stop]);

  return { status, minAmp, runCalibration };
}
