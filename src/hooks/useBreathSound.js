import { useEffect, useRef } from 'react';

// ===== 전역 싱글턴 AudioContext =====
// 브라우저 자동재생 정책: AudioContext는 사용자 제스처 후에만 resume 가능
// 첫 pointerdown에서 한 번 활성화해두면 이후 자동재생 가능
let _ctx = null;
let _warmed = false;

function getOrCreateCtx() {
  if (!_ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
  }
  return _ctx;
}

// 앱 어디서든 첫 사용자 제스처에 호출됨 → 이후 호흡 사운드 자동재생 가능
function warmAudio() {
  if (_warmed) return;
  const ctx = getOrCreateCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  // 무음 짧은 buffer 재생 — iOS 등 강하게 잠긴 브라우저 우회
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
  } catch {}
  _warmed = true;
}

// 1회성 글로벌 리스너 — 앱 로드 직후 첫 클릭/탭에서 활성화
if (typeof window !== 'undefined' && !window.__ddcircleAudioWarmer) {
  window.__ddcircleAudioWarmer = true;
  const handler = () => {
    warmAudio();
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler, { once: false });
  window.addEventListener('keydown', handler, { once: false });
}

// ===== 호흡 사운드 훅 =====
// phase: 'inhale' | 'hold' | 'exhale'
// enabled: false면 재생 안 함
// durations: { inhale, hold, exhale } — 효과음 길이를 phase 길이에 맞춤
export function useBreathSound({ phase, enabled, durations }) {
  const lastPlayedRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (lastPlayedRef.current === phase) return;
    lastPlayedRef.current = phase;

    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // 효과음은 phase 길이보다 살짝 짧게 (페이드 자연스럽게)
    const inhaleDur = Math.max(1.5, (durations?.inhale ?? 4) - 0.2);
    const exhaleDur = Math.max(1.5, (durations?.exhale ?? 8) - 0.2);

    if (phase === 'inhale') playGlide(ctx, 220, 440, inhaleDur);
    else if (phase === 'hold') {
      // hold 길이가 0이면 종소리 생략
      if ((durations?.hold ?? 0) > 0) playBell(ctx, 660);
    }
    else if (phase === 'exhale') playGlide(ctx, 440, 165, exhaleDur);
  }, [phase, enabled, durations?.inhale, durations?.hold, durations?.exhale]);
}

// 부드러운 sine 글라이드 (호흡 흐름 사운드)
function playGlide(ctx, fromHz, toHz, durationSec) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(fromHz, now);
  osc.frequency.exponentialRampToValueAtTime(toHz, now + durationSec);

  // 부드러운 페이드 인/아웃
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.3);
  gain.gain.setValueAtTime(0.06, now + durationSec - 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  filter.type = 'lowpass';
  filter.frequency.value = 1200;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.05);
}

// 짧은 종소리 (멈춤 시작)
function playBell(ctx, hz) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.85);
}
