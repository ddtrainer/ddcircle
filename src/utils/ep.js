// EP 보너스 계산 — 부분 완주 반영
//   Dash 60초 완주        +10
//   Deep N사이클 완주      +15
//   둘 다 완주 (Full Set)  +5 보너스
//   Proof 셀카             +5
//   외부 공유              +5
//   × streak 멀티플라이어
//
// Skip한 단계는 0점 — "완주해야 인정"
//
// 또한 하루 2회까지만 EP 인정. 3회차 이후는 EP 0 (세션 진행 자체는 허용).
export const DAILY_EP_CAP_SESSIONS = 2;

export function getMultiplier(streak) {
  if (streak >= 100) return 1.5;
  if (streak >= 30) return 1.3;
  if (streak >= 14) return 1.2;
  if (streak >= 7) return 1.1;
  return 1;
}

export function calculateEarnedEp({
  dashFully = false,
  deepFully = false,
  hasProof = false,
  shared = false,
  streak = 0,
  todaySessionCount = 0,  // 이번 세션 포함 전 카운트 (0이면 오늘 첫 세션)
}) {
  // 하루 2회 캡 — 3회차부터 0 EP
  if (todaySessionCount >= DAILY_EP_CAP_SESSIONS) return 0;

  let ep = 0;
  if (dashFully) ep += 10;
  if (deepFully) ep += 15;
  if (dashFully && deepFully) ep += 5;  // Full Set 보너스
  if (hasProof) ep += 5;
  if (shared) ep += 5;
  return Math.round(ep * getMultiplier(streak));
}
