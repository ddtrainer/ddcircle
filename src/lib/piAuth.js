// Pi Network SDK 연동 — SDK 로드 → Pi.init(Promise로 await) → Pi.authenticate(['username']).
// 반환된 access token은 백엔드(/api/auth/pi)가 https://api.minepi.com/v2/me 로 검증한다.
// 참고: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Authentication

const PI_SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';

// sandbox 플래그 — 실제 Pi Browser/Pi Desktop에서 도는 앱은 반드시 false(프로덕션 네트워크 연결).
// true는 로컬(sandbox.minepi.com)에서 테스트할 때만. Testnet/Mainnet은 이 플래그가 아니라
// 개발자 포털의 '앱 등록 네트워크'로 결정된다. → 기본 false.
// 로컬 샌드박스 테스트가 필요하면 VITE_PI_SANDBOX=true 로 지정.
const SANDBOX = import.meta.env.VITE_PI_SANDBOX != null
  ? String(import.meta.env.VITE_PI_SANDBOX) === 'true'
  : false;

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

// Pi.authenticate 필수 콜백 — 인증 시점에 미완료 결제가 발견되면 절대 무시하지 않고
// 서버(/api/payments/complete)로 완료 처리한다.
export function onIncompletePaymentFound(payment) {
  const paymentId = payment && payment.identifier;
  const txid = payment && payment.transaction && payment.transaction.txid;
  if (!paymentId) return;
  fetch('/api/payments/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ paymentId, txid }),
  }).catch((e) => console.error('[pi] incomplete payment complete failed', e));
}

// username + payments 스코프로 인증(결제를 위해 payments 확장). 반환: { accessToken, user }
export async function authenticateWithPi() {
  const Pi = await initPi();               // init을 완전히 await 한 뒤에만 authenticate
  const scopes = ['username', 'payments'];
  return Pi.authenticate(scopes, onIncompletePaymentFound);
}

// 백엔드가 access token을 /me 로 검증하고 세션(HttpOnly 쿠키)을 수립.
// 아울러 Pi 신원에 대응하는 Supabase 계정의 일회용 토큰을 받아 실제 Supabase 세션까지 연결한다.
// (이게 없으면 응원나라·프로필·책장이 계속 '비로그인'으로 동작한다)
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
  const data = await res.json(); // { user: { uid, username }, supabase?: { tokenHash } }

  // Supabase 세션 수립 — 실패해도 Pi 로그인 자체는 유지(앱은 로컬 저장으로 계속 동작).
  const tokenHash = data?.supabase?.tokenHash;
  if (tokenHash) {
    try {
      const { supabase } = await import('./supabase');
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' });
      if (error) console.error('[pi-auth] supabase session failed:', error.message);
    } catch (e) {
      console.error('[pi-auth] supabase session error:', e);
    }
  }
  return data;
}

export function piSdkAvailable() {
  return typeof window !== 'undefined' && !!window.Pi;
}

// Pi Browser 여부 — 이 환경에서만 자동 인증/버튼을 노출(일반 웹은 무영향).
export function isPiBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /PiBrowser/i.test(navigator.userAgent);
}
