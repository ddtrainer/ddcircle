// EP 보너스 계산
// base: Dash(10) + Deep(15) + Full Set(5) = 30
// + Proof 5, + Share 5, * Multiplier(streak)
const BASE_EP = 30;

export function getMultiplier(streak) {
  if (streak >= 100) return 1.5;
  if (streak >= 30) return 1.3;
  if (streak >= 14) return 1.2;
  if (streak >= 7) return 1.1;
  return 1;
}

export function calculateEarnedEp({ hasProof = false, shared = false, streak = 0 }) {
  let ep = BASE_EP;
  if (hasProof) ep += 5;
  if (shared) ep += 5;
  return Math.round(ep * getMultiplier(streak));
}
