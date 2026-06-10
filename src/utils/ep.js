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

// DD 토큰(DDT) 전환 — 누적 EP를 토큰으로 환산하는 비율.
//   100 EP = 1 DDT (원래 설계). 전환은 누적 EP 기준이며 차감하지 않는다(표시용 환산).
export const EP_PER_DDT = 100;

// 누적 EP → 보유 DDT (내림). ep 100당 1개.
export function epToDdt(ep = 0) {
  return Math.floor((Number(ep) || 0) / EP_PER_DDT);
}

// 다음 1 DDT까지 남은 EP (1~EP_PER_DDT). 진행 안내용.
export function epToNextDdt(ep = 0) {
  const rem = (Number(ep) || 0) % EP_PER_DDT;
  return EP_PER_DDT - rem;
}

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
  // DD 레벨 배율 — 트랙별 완주 점수에만 곱한다. 미지정 시 1.0 (기존 동작 유지).
  deepMultiplier = 1,
  dashMultiplier = 1,
}) {
  // 하루 2회 캡 — 3회차부터 0 EP
  if (todaySessionCount >= DAILY_EP_CAP_SESSIONS) return 0;

  let ep = 0;
  if (dashFully) ep += 10 * dashMultiplier;
  if (deepFully) ep += 15 * deepMultiplier;
  if (dashFully && deepFully) ep += 5;  // Full Set 보너스 (배율 미적용)
  if (hasProof) ep += 5;
  if (shared) ep += 5;
  return Math.round(ep * getMultiplier(streak));
}
