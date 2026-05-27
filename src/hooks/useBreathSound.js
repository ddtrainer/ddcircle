import { useEffect, useRef } from 'react';

// ============================================================
// 사운드 시스템
// - 배경음: 시간대 기반 자동 선택 (00:00–12:00 새소리 / 12:00–24:00 물소리)
//   · 디바이스 로컬 시간 사용 → 글로벌 사용자도 자기 위치 기준으로 자동 동작
// - 종소리: phase 전환 시점 (들숨 시작 / 날숨 시작)
// - 페이드 인/아웃으로 자연스러운 진입과 종료
// ============================================================

// Audio 엘리먼트 싱글턴 (페이지 내 한 번만 생성, 메모리 재사용)
let bgAudio = null;
let bgCurrentSrc = null;
let bellIn = null;
let bellOut = null;

// 시간대 기반 배경음 선택
function selectBackgroundSrc() {
  const hour = new Date().getHours();
  // 05:00–11:59 새소리 (새벽~오전, 실제 새가 우는 시간)
  // 12:00–04:59 물소리 (오후·저녁·밤·한밤중·새벽까지 차분한 흐름)
  const isMorning = hour >= 5 && hour < 12;
  return isMorning ? '/audio/bird.mp3' : '/audio/water.mp3';
}

function ensureBackground() {
  const desired = selectBackgroundSrc();
  if (!bgAudio || bgCurrentSrc !== desired) {
    if (bgAudio) {
      try { bgAudio.pause(); } catch { /* ignore */ }
    }
    bgAudio = new Audio(desired);
    bgAudio.loop = true;
    bgAudio.preload = 'auto';
    bgAudio.volume = 0;
    bgCurrentSrc = desired;
  }
  return bgAudio;
}

function ensureBells() {
  if (!bellIn) {
    bellIn = new Audio('/audio/bell-in.mp3');
    bellIn.preload = 'auto';
    bellIn.volume = 0.1;
  }
  if (!bellOut) {
    bellOut = new Audio('/audio/bell-out.wav');
    bellOut.preload = 'auto';
    bellOut.volume = 1.0;
  }
}

// 멈춤(hold/postHold) 차임 — 화면 안 봐도 "지금 멈춰" 신호 주는 용도
// 두 개 사인파 중첩(880Hz + 1320Hz=5도)으로 풍성한 차임 톤. 게인 크게 (0.5).
// 들숨/날숨 벨과 명확히 구분되고, 멀리서도 들리도록 충분히 큼.
let holdAudioCtx = null;
function playHoldChime() {
  try {
    if (!holdAudioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      holdAudioCtx = new Ctx();
    }
    // iOS Safari 등에서 컨텍스트가 suspended 상태일 수 있음 — 사용자 제스처 후엔 resume 가능
    if (holdAudioCtx.state === 'suspended') {
      holdAudioCtx.resume().catch(() => {});
    }
    const ctx = holdAudioCtx;
    const now = ctx.currentTime;

    // 마스터 게인 — clipping 방지를 위해 2개 osc 후 별도 단계로 조절
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.55, now + 0.015);    // 강한 attack, 즉시 큰 소리
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.4); // 살짝 sustain
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // 길게 fade
    master.connect(ctx.destination);

    // 기본 톤 A5 (880Hz) — 또렷한 메인
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.6, now);
    osc1.connect(g1).connect(master);

    // 5도 위 E6 (1320Hz) — 차임 느낌 + 존재감
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.4, now);
    osc2.connect(g2).connect(master);

    osc1.start(now); osc2.start(now);
    osc1.stop(now + 1.25); osc2.stop(now + 1.25);
  } catch { /* AudioContext 미지원/실패 시 무시 */ }
}

// 배경음 볼륨 페이드 (currentTime은 보존 → 일시정지/재개 시 위치 유지)
let fadeTimer = null;
function fadeBackground(targetVol, durationMs) {
  if (!bgAudio) return;
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
  const startVol = bgAudio.volume;
  const steps = 24;
  const tick = Math.max(20, Math.floor(durationMs / steps));
  let i = 0;
  fadeTimer = setInterval(() => {
    i++;
    const v = startVol + (targetVol - startVol) * (i / steps);
    if (bgAudio) bgAudio.volume = Math.max(0, Math.min(1, v));
    if (i >= steps) {
      clearInterval(fadeTimer);
      fadeTimer = null;
      if (bgAudio) {
        bgAudio.volume = targetVol;
        if (targetVol === 0) {
          try { bgAudio.pause(); } catch { /* ignore */ }
        }
      }
    }
  }, tick);
}

// ============================================================
// useBreathSound 훅
// phase: 'inhale' | 'hold' | 'exhale'
// enabled: false면 모든 사운드 정지
// durations: 호환성 위해 받지만 현재 시스템에선 미사용
// ============================================================
export function useBreathSound({ phase, enabled }) {
  const lastPhaseRef = useRef(null);

  // 1) phase 전환 시 종소리
  useEffect(() => {
    if (!enabled) {
      lastPhaseRef.current = null;
      return;
    }
    if (lastPhaseRef.current === phase) return;
    lastPhaseRef.current = phase;

    ensureBells();
    try {
      if (phase === 'inhale' && bellIn) {
        bellIn.currentTime = 0;
        bellIn.play().catch(() => { /* 자동재생 정책 거부 시 무시 */ });
      } else if (phase === 'exhale' && bellOut) {
        bellOut.currentTime = 0;
        bellOut.play().catch(() => { /* ignore */ });
      } else if (phase === 'hold' || phase === 'postHold') {
        // 멈춤 phase 진입 — 합성 차임으로 신호 (화면 안 보고도 들림)
        playHoldChime();
      }
    } catch { /* ignore */ }
  }, [phase, enabled]);

  // 2) 배경음 lifecycle (enabled가 토글될 때마다 페이드)
  useEffect(() => {
    if (enabled) {
      const bg = ensureBackground();
      const p = bg.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { /* 자동재생 거부 시 무시 — 첫 사용자 제스처 후엔 정상 동작 */ });
      }
      fadeBackground(0.11, 1500);
    } else {
      fadeBackground(0, 800);
    }
  }, [enabled]);

  // 3) 컴포넌트 unmount 시 배경음 페이드 아웃
  useEffect(() => {
    return () => {
      fadeBackground(0, 600);
    };
  }, []);
}
