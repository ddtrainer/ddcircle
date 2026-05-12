// 사용자 행동 분석 — PostHog (선택)
// VITE_POSTHOG_KEY 환경변수가 있으면 자동 활성화. 없으면 no-op.

import posthog from 'posthog-js';

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return; // 키 없으면 비활성화 (개발 환경 등)

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  });
  initialized = true;
}

// 이벤트 추적 (no-op 안전)
export function track(event, properties = {}) {
  if (!initialized) return;
  try { posthog.capture(event, properties); } catch {}
}

// 깔때기 분석을 위한 핵심 이벤트
export const Events = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  EXERCISE_SELECTED: 'exercise_selected',
  DASH_STARTED: 'dash_started',
  DASH_COMPLETED: 'dash_completed',
  PROOF_RECORDED: 'proof_recorded',
  PROOF_SKIPPED: 'proof_skipped',
  DEEP_STARTED: 'deep_started',
  DEEP_COMPLETED: 'deep_completed',
  SESSION_SHARED: 'session_shared',
  SESSION_SKIPPED_SHARE: 'session_skipped_share',
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_COMPLETED: 'challenge_completed',
  INVITE_SENT: 'invite_sent',
};
