import { useCallback, useState } from 'react';
import { SPRINT, SPRINT_KEYS } from '../data/sprintConfig';
import { createSprintDetector } from '../lib/sprintDetector';

// 저장된 개인 임계값 조회 (없으면 기본값)
export function getCalibratedThreshold() {
  try {
    const v = parseFloat(localStorage.getItem(SPRINT_KEYS.threshold));
    return Number.isFinite(v) && v > 0 ? v : SPRINT.DEFAULT_THRESHOLD;
  } catch {
    return SPRINT.DEFAULT_THRESHOLD;
  }
}

// 캘리브레이션이 필요한지 (한 번도 안 했으면 필요)
export function needsCalibration() {
  try {
    return !localStorage.getItem(SPRINT_KEYS.threshold);
  } catch {
    return true;
  }
}

// "3번 빠르게 뛰어보세요" — 진폭을 모아 개인 임계값 산출.
// 임계값 = 감지된 피크 진폭 중앙값 × 0.55 (기본값 근처로 클램프). 너무 예민/둔감하지 않게.
// start/stop 은 useDeviceMotion 것을 주입받는다(권한은 호출 전 이미 획득 상태여야 함).
export function useSprintCalibration({ start, stop }) {
  const [status, setStatus] = useState('idle'); // idle|running|done
  const [threshold, setThreshold] = useState(getCalibratedThreshold);

  const runCalibration = useCallback((durationMs = SPRINT.CALIB_MS) => {
    return new Promise((resolve) => {
      setStatus('running');
      // 낮은 임계값으로 우선 감지해 진폭 샘플 확보
      const det = createSprintDetector({ threshold: 11, minIntervalMs: SPRINT.MIN_PEAK_INTERVAL_MS });
      start((x, y, z, ts) => det.addSample(x, y, z, ts));
      setTimeout(() => {
        stop();
        const { peakAmps } = det.getResult();
        let th = SPRINT.DEFAULT_THRESHOLD;
        if (peakAmps.length >= 2) {
          const sorted = [...peakAmps].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          th = Math.min(24, Math.max(11, median * 0.55));
        }
        try { localStorage.setItem(SPRINT_KEYS.threshold, String(th)); } catch { /* ignore */ }
        setThreshold(th);
        setStatus('done');
        resolve(th);
      }, durationMs);
    });
  }, [start, stop]);

  return { status, threshold, runCalibration };
}
