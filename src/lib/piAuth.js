// Pi Network SDK 연동 — SDK 로드 → Pi.init(Promise로 await) → Pi.authenticate(['username']).
// 반환된 access token은 백엔드(/api/auth/pi)가 https://api.minepi.com/v2/me 로 검증한다.
// 참고: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Authentication

const PI_SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';

// 샌드박스(Testnet) 여부 — 환경변수 우선, 없으면 기본 true.
// App Studio/Pi Desktop 검증은 Testnet(sandbox) 흐름이라 기본 true여야 로그인이 성립한다.
// Mainnet 배포 시엔 VITE_PI_SANDBOX=false 로 지정.
const SANDBOX = import.meta.env.VITE_PI_SANDBOX != null
  ? String(import.meta.env.VITE_PI_SANDBOX) === 'true'
  : true;

let sdkPromise = null;
let initPromise = null;

// window.Pi 가 준비될 때까지 대기 (index.html 스크립트 로드 완료 보장)
export function loadPiSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.Pi) return Promise.resolve(window.Pi);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PI_SDK_URL}"]`);
    if (!existing) {
      const s = document.createElement('script');
      s.src = PI_SDK_URL;
      s.async = true;
      s.addEventListener('error', () => reject(new Error('Pi SDK load failed')), { once: true });
      document.head.appendChild(s);
    }
    // window.Pi 노출까지 폴링 (load 이벤트 유실 대비)
    let tries = 0;
    const iv = setInterval(() => {
      if (window.Pi) { clearInterval(iv); resolve(window.Pi); }
      else if (++tries > 60) { clearInterval(iv); reject(new Error('Pi SDK unavailable — open in Pi Browser')); }
    }, 100);
  });
  return sdkPromise;
}

// Pi.init(...)을 Promise로 취급하고 완전히 await 한 뒤 SDK를 반환.
export function initPi() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const Pi = await loadPiSdk();
    await Pi.init({ version: '2.0', sandbox: SANDBOX });
    return Pi;
  })();
  return initPromise;
}

// 결제 미사용 — Pi.authenticate 필수 콜백. 미완료 결제가 있으면 로그만 남긴다.
function onIncompletePaymentFound(payment) {
  console.warn('[pi] incomplete payment found:', payment && payment.identifier);
}

// username 스코프로 인증. 반환: { accessToken, user: { uid, username } }
// Pi Browser 밖에선 authenticate가 응답하지 않으므로 타임아웃으로 우아하게 종료.
const AUTH_TIMEOUT_MS = 120000;
export async function authenticateWithPi() {
  const Pi = await initPi();               // init을 완전히 await 한 뒤에만 authenticate
  const scopes = ['username'];
  return Promise.race([
    Pi.authenticate(scopes, onIncompletePaymentFound),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Pi authenticate timed out — open in Pi Browser')), AUTH_TIMEOUT_MS)
    ),
  ]);
}

// 백엔드가 access token을 /me 로 검증하고 세션(HttpOnly 쿠키)을 수립.
export async function verifyWithBackend(accessToken) {
  const res = await fetch('/api/auth/pi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`backend verify failed (${res.status}) ${msg}`);
  }
  return res.json(); // { user: { uid, username } }
}

export function piSdkAvailable() {
  return typeof window !== 'undefined' && !!window.Pi;
}

// Pi Browser 여부 — 이 환경에서만 자동 인증/버튼을 노출(일반 웹은 무영향).
export function isPiBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /PiBrowser/i.test(navigator.userAgent);
}
