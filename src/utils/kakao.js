// Kakao SDK 초기화
// JavaScript 키 — 도메인 제한이 있어 브라우저 노출 안전
// (Kakao Developers > 플랫폼 > Web 도메인 등록 필수)
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || 'ded4dfa9de45a1d3742e0f4fca4ce545';

let initialized = false;

export function initKakao() {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  if (!window.Kakao) return; // SDK 로드 실패 시 (CDN 차단 등)
  if (window.Kakao.isInitialized?.()) {
    initialized = true;
    return;
  }
  try {
    window.Kakao.init(KAKAO_JS_KEY);
    initialized = window.Kakao.isInitialized();
  } catch (e) {
    console.warn('Kakao SDK init failed:', e);
  }
}

export function isKakaoReady() {
  return initialized && typeof window !== 'undefined' && !!window.Kakao?.Share?.sendDefault;
}
