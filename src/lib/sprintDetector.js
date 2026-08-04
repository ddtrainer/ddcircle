// 전력질주 스텝 계수 — 로컬 피크(각 착지) 직접 감지. (React 무관, 순수 로직)
//
// 방식: 착지마다 생기는 '국소 최대점(local maximum)'을 검출하고,
//   직전 골짜기 대비 돌출(prominence = peak - valley)이 minAmp 이상이며
//   불응기(minIntervalMs)를 지났을 때만 1스텝으로 센다.
//   → 케이던스(느림/빠름)와 무관하게 각 스텝을 잡는다. 고정 윈도우의 양극단 누락 해결.
//   방향 무관: dyn = |가속도 크기| - 중력. 경량 스무딩 + 불응기로 착지당 1회.
import { SPRINT, GRAVITY } from '../data/sprintConfig';

// rhythmGate: true면 일정 리듬으로 WARMUP회 연속될 때만 카운트(앉아서 흔들기 등 무시).
//   캘리브레이션은 모든 피크 진폭이 필요하므로 rhythmGate:false로 호출한다.
export function createSprintDetector({
  minAmp,
  minIntervalMs,
  rhythmGate = true,
  rhythmMaxGap = SPRINT.RHYTHM_MAX_GAP_MS,
  warmup = SPRINT.RHYTHM_WARMUP,
}) {
  let count = 0;
  let lastPeakTs = -Infinity;
  let ema = 0;
  let emaInit = false;
  let prevV = -Infinity;
  let rising = false;
  let valley = Infinity;   // 마지막 피크 이후 최소값(골짜기)
  let streak = 0;          // 리듬으로 연속된 피크 수(리듬 게이트)
  const pendingTimes = []; // 예열 중(미확정) 피크 버퍼 — WARMUP 충족 시 소급 카운트
  const pendingAmps = [];
  const peakTimes = [];
  const peakAmps = [];
  let samples = 0;

  return {
    addSample(x, y, z, ts) {
      samples++;
      const dyn = Math.sqrt(x * x + y * y + z * z) - GRAVITY; // 방향 무관 동적 가속
      // 경량 스무딩(마이크로 지터 제거, 피크는 보존)
      ema = emaInit ? ema * 0.4 + dyn * 0.6 : dyn;
      emaInit = true;
      const v = ema;

      if (v < valley) valley = v;      // 골짜기 추적

      if (v > prevV) {
        rising = true;
      } else if (v < prevV && rising) {
        // 방금 국소 최대점(prevV)을 지남
        rising = false;
        const prom = prevV - valley;   // 골짜기 대비 돌출
        if (prom >= minAmp && (ts - lastPeakTs) >= minIntervalMs) {
          if (!rhythmGate) {
            count++;
            peakTimes.push(ts);
            peakAmps.push(prom);
          } else {
            // 직전 피크와의 간격이 리듬 범위 안이면 스트릭 연장, 아니면 새 스트릭
            const gap = ts - lastPeakTs;
            if (Number.isFinite(gap) && gap <= rhythmMaxGap) {
              streak++;
            } else {
              streak = 1;
              pendingTimes.length = 0;   // 리듬 끊김 → 미확정 피크 폐기
              pendingAmps.length = 0;
            }
            pendingTimes.push(ts);
            pendingAmps.push(prom);
            if (streak >= warmup) {
              // 예열 충족 — 버퍼의 피크를 소급 카운트(실제 운동 초반 스텝 보존)
              for (let i = 0; i < pendingTimes.length; i++) {
                count++;
                peakTimes.push(pendingTimes[i]);
                peakAmps.push(pendingAmps[i]);
              }
              pendingTimes.length = 0;
              pendingAmps.length = 0;
            }
          }
          lastPeakTs = ts;
          valley = v;                  // 다음 스텝용 골짜기 리셋
        }
      }
      prevV = v;
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

// 웹 대체 검증 — 리듬 규칙성(cv, 완화 상한) + 최소 횟수.
// verified=false여도 EP는 정상 지급(기록만 남김).
export function verifySprint({ count, cv }) {
  const rhythmOk = cv <= SPRINT.RHYTHM_CV_MAX;
  const countOk = count >= SPRINT.MIN_VALID_COUNT;
  const verified = rhythmOk && countOk;
  const confidence = (rhythmOk ? 0.6 : 0) + (countOk ? 0.4 : 0);
  return { verified, confidence, rhythmOk, countOk };
}
