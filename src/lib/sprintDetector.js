// 전력질주 피크 감지 — 순수 로직(React 무관, 테스트 용이).
// Y축(상하) 가속도가 threshold를 상향 돌파 → 로컬 최대 기록 → 하향 복귀 시,
// 직전 피크로부터 minIntervalMs 이상 지났으면 1회로 카운트한다.
import { SPRINT } from '../data/sprintConfig';

export function createSprintDetector({ threshold, minIntervalMs }) {
  let count = 0;
  let above = false;
  let localMax = 0;
  let lastPeakTs = -Infinity;
  const peakTimes = [];
  const peakAmps = [];
  const energy = { x: 0, y: 0, z: 0 };
  let samples = 0;

  return {
    addSample(x, y, z, ts) {
      samples++;
      energy.x += Math.abs(x);
      energy.y += Math.abs(y);
      energy.z += Math.abs(z);
      const v = y; // 상하축
      if (v >= threshold) {
        if (!above) { above = true; localMax = v; }
        else if (v > localMax) localMax = v;
      } else if (above) {
        above = false;
        if (ts - lastPeakTs >= minIntervalMs) {
          count++;
          lastPeakTs = ts;
          peakTimes.push(ts);
          peakAmps.push(localMax);
        }
        localMax = 0;
      }
    },
    get count() { return count; },
    lastPeakAt() { return lastPeakTs; },
    getResult() {
      const avgAmp = peakAmps.length
        ? peakAmps.reduce((a, b) => a + b, 0) / peakAmps.length : 0;
      const intervals = [];
      for (let i = 1; i < peakTimes.length; i++) intervals.push(peakTimes[i] - peakTimes[i - 1]);
      const meanInt = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
      const varInt = intervals.length
        ? intervals.reduce((a, b) => a + (b - meanInt) ** 2, 0) / intervals.length : 0;
      const cv = meanInt ? Math.sqrt(varInt) / meanInt : 1; // 간격 변동계수
      const totalE = energy.x + energy.y + energy.z || 1;
      const yDom = energy.y / totalE;
      return { count, avgAmp, cv, yDom, peakAmps, peakTimes, samples };
    },
  };
}

// 웹 대체 검증 — 걸음센서(CMPedometer/StepCounter) 접근 불가로,
// (1) 리듬 규칙성(cv) (2) Y축 에너지 우세(yDom) (3) 최소 횟수 로 신뢰도 산출.
// verified=false여도 EP는 정상 지급(기록만 남김) — 스펙의 sprint_verified 취지.
export function verifySprint({ count, cv, yDom }) {
  const rhythmOk = cv <= SPRINT.RHYTHM_CV_MAX;   // 규칙적 리듬(달리기) vs 불규칙(흔들기)
  const axisOk = yDom >= SPRINT.Y_DOMINANCE_MIN; // 상하 움직임 우세
  const countOk = count >= SPRINT.MIN_VALID_COUNT;
  const verified = rhythmOk && axisOk && countOk;
  const confidence = (rhythmOk ? 0.5 : 0) + (axisOk ? 0.3 : 0) + (countOk ? 0.2 : 0);
  return { verified, confidence, rhythmOk, axisOk, countOk };
}
