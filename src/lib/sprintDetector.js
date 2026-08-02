// 전력질주 피크 감지 — 순수 로직(React 무관, 테스트 용이).
// 방향 무관(orientation-independent): 가속도 '전체 크기(magnitude)'에서 중력을 뺀
//   dyn = sqrt(x²+y²+z²) - GRAVITY  (정지 시 ~0, 발 착지 시 큰 양의 스파이크)
// 를 추적한다. magnitude는 방향에 불변이라 폰을 어떻게 쥐어도 동일하게 동작.
// dyn이 threshold를 상향 돌파 → 로컬 최대 기록 → 하향 복귀 시,
// 직전 피크로부터 minIntervalMs 이상 지났으면 1회로 카운트.
import { SPRINT, GRAVITY } from '../data/sprintConfig';

export function createSprintDetector({ threshold, minIntervalMs }) {
  let count = 0;
  let above = false;
  let localMax = 0;
  let lastPeakTs = -Infinity;
  const peakTimes = [];
  const peakAmps = [];
  let samples = 0;

  return {
    addSample(x, y, z, ts) {
      samples++;
      const dyn = Math.sqrt(x * x + y * y + z * z) - GRAVITY; // 방향 무관 동적 가속
      if (dyn >= threshold) {
        if (!above) { above = true; localMax = dyn; }
        else if (dyn > localMax) localMax = dyn;
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
      const cv = meanInt ? Math.sqrt(varInt) / meanInt : 1; // 간격 변동계수(리듬 규칙성)
      return { count, avgAmp, cv, peakAmps, peakTimes, samples };
    },
  };
}

// 웹 대체 검증 — 걸음센서(CMPedometer/StepCounter) 접근 불가로,
// (1) 리듬 규칙성(cv, 완화된 상한) (2) 최소 횟수 로 신뢰도 산출.
// verified=false여도 EP는 정상 지급(기록만 남김) — 스펙의 sprint_verified 취지.
export function verifySprint({ count, cv }) {
  const rhythmOk = cv <= SPRINT.RHYTHM_CV_MAX;      // 규칙적 리듬(달리기) vs 불규칙(흔들기)
  const countOk = count >= SPRINT.MIN_VALID_COUNT;  // 최소 횟수
  const verified = rhythmOk && countOk;
  const confidence = (rhythmOk ? 0.6 : 0) + (countOk ? 0.4 : 0);
  return { verified, confidence, rhythmOk, countOk };
}
