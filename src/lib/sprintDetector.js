// 전력질주 스텝 계수 — 적응형(self-adjusting) 피크 계수. (React 무관, 순수 로직)
//
// 배경: '고정 임계값 상향돌파' 방식은 격한 연속 운동에서 신호가 임계값 위에 머물러
//   내려오는 순간이 없어 카운트를 놓친다("빠를수록 적게" 역전).
// 해결: 최근 WINDOW_MS 구간의 min~max 중간값을 '실시간 기준선(thr)'으로 삼고,
//   신호가 기준선을 상향 교차할 때마다 1스텝(진동 1사이클 = 1보/1바운스)으로 센다.
//   강도가 세든 약하든 각 사이클을 잡는다. 방향 무관: dyn = |가속도 크기| - 중력.
import { SPRINT, GRAVITY } from '../data/sprintConfig';

const WINDOW_MS = 400;

export function createSprintDetector({ minAmp, minIntervalMs }) {
  let count = 0;
  let lastPeakTs = -Infinity;
  let prevAbove = false;
  let ema = 0;
  let emaInit = false;
  const win = [];        // { ts, v } — 최근 구간
  const peakTimes = [];
  const peakAmps = [];
  let samples = 0;

  return {
    addSample(x, y, z, ts) {
      samples++;
      const dyn = Math.sqrt(x * x + y * y + z * z) - GRAVITY; // 방향 무관 동적 가속
      // 경량 스무딩(노이즈 억제)
      ema = emaInit ? ema * 0.5 + dyn * 0.5 : dyn;
      emaInit = true;
      const v = ema;

      win.push({ ts, v });
      while (win.length && ts - win[0].ts > WINDOW_MS) win.shift();
      let mn = Infinity, mx = -Infinity;
      for (const s of win) { if (s.v < mn) mn = s.v; if (s.v > mx) mx = s.v; }
      const amp = mx - mn;              // 최근 구간 진폭(peak-to-peak)
      const thr = (mx + mn) / 2;        // 실시간 적응 기준선
      const above = v > thr;

      // 상향 교차 + 충분한 진폭 + 최소 간격 → 1스텝
      if (above && !prevAbove && amp >= minAmp && (ts - lastPeakTs) >= minIntervalMs) {
        count++;
        lastPeakTs = ts;
        peakTimes.push(ts);
        peakAmps.push(amp);
      }
      prevAbove = above;
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
