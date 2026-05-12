// Dash 세션 시작/종료 효과음 (Web Audio API)
// useBreathSound.js의 전역 AudioContext warmer를 그대로 활용

let _ctx = null;
function getCtx() {
  if (!_ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume().catch(() => {});
  }
  return _ctx;
}

// 짧은 음표 (sine + 부드러운 envelope)
function playNote(ctx, hz, startOffset, durationSec, peakGain = 0.12) {
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle'; // sine보다 살짝 밝은 톤
  osc.frequency.setValueAtTime(hz, t0);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationSec + 0.05);
}

// 시작 효과음: 경쾌한 상행 아르페지오 (C5 → E5 → G5)
export function playDashStart() {
  const ctx = getCtx();
  if (!ctx) return;
  // C5(523), E5(659), G5(784) — 메이저 코드 빠른 상승
  playNote(ctx, 523.25, 0, 0.18, 0.13);
  playNote(ctx, 659.25, 0.1, 0.18, 0.13);
  playNote(ctx, 783.99, 0.2, 0.35, 0.15);
}

// 종료 효과음: 성취감 있는 트라이어드 (C5 + E5 + G5 동시 → 짧은 플러시)
export function playDashEnd() {
  const ctx = getCtx();
  if (!ctx) return;
  // 동시 코드(승리감) + 살짝 늦은 옥타브 위 강조음
  playNote(ctx, 523.25, 0, 0.5, 0.1);
  playNote(ctx, 659.25, 0, 0.5, 0.1);
  playNote(ctx, 783.99, 0, 0.5, 0.1);
  playNote(ctx, 1046.5, 0.15, 0.45, 0.13); // C6 — 강조
}
