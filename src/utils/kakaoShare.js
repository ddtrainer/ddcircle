// 카카오톡 공유 — SDK를 필요할 때만(버튼을 눌렀을 때) 내려받는다.
// index.html에 상시 로드해두면 카카오톡을 안 쓰는 대다수 국가 사용자까지 CDN 요청을
// 부담하게 되므로, 첫 클릭 시점에 동적으로 붙인다.
//
// JavaScript 키는 도메인 제한이 걸려 있어 브라우저 노출이 안전하다.
// (Kakao Developers > 내 애플리케이션 > 플랫폼 > Web 사이트 도메인에 등록된 곳에서만 동작)
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

// 카카오 피드 카드에 쓰는 대표 이미지. 반드시 절대 URL이어야 하고(카카오 서버가 직접
// 긁어간다), index.html의 og:image와 같은 카드를 쓴다.
const SHARE_CARD_IMAGE = 'https://www.ddcircle.app/og-card.png';
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || 'ded4dfa9de45a1d3742e0f4fca4ce545';

let loadPromise = null;

function loadSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`);
    if (!existing) {
      const s = document.createElement('script');
      s.src = KAKAO_SDK_URL;
      s.async = true;
      s.addEventListener('load', () => resolve(window.Kakao), { once: true });
      s.addEventListener('error', () => reject(new Error('Kakao SDK load failed')), { once: true });
      document.head.appendChild(s);
      return;
    }
    // 이미 붙어 있는데 window.Kakao가 아직이면 잠깐 폴링
    let tries = 0;
    const iv = setInterval(() => {
      if (window.Kakao) { clearInterval(iv); resolve(window.Kakao); }
      else if (++tries > 50) { clearInterval(iv); reject(new Error('Kakao SDK unavailable')); }
    }, 100);
  });
  return loadPromise;
}

async function initKakao() {
  const Kakao = await loadSdk();
  if (!Kakao.isInitialized?.()) Kakao.init(KAKAO_JS_KEY);
  return Kakao;
}

// 카카오톡 앱만 띄운다(메시지는 호출부가 이미 클립보드에 담아둔 상태).
// SDK 공유가 막히는 환경에서 쓰는 최후 수단이라, 반드시 클릭 핸들러 안에서
// 동기로 호출해야 한다 — await 뒤에 부르면 제스처가 풀려 브라우저가 막는다.
//
// 커스텀 스킴은 HTTP 응답이 아니라 OS가 가로채므로, wa.me/t.me를 막았던
// 프레임 차단 헤더 문제와는 무관하다. 미설치 시엔 아무 일도 일어나지 않게 두고
// (스토어로 튕기지 않게) 사용자는 복사된 문구를 그대로 쓰면 된다.
export function openKakaoTalkApp() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const url = /android/i.test(ua)
    ? 'intent://#Intent;scheme=kakaotalk;package=com.kakao.talk;end'
    : 'kakaotalk://';
  try {
    const win = window.open(url, '_blank');
    if (!win) {
      try { window.top.location.href = url; } catch { window.location.href = url; }
    }
  } catch {
    try { window.location.href = url; } catch { /* 무시 */ }
  }
}

// 카카오 공유가 실제로 일어났는지 확인 — sendDefault는 프로미스도 아니고 실패해도
// 예외를 던지지 않아서, 호출만으로는 성공 여부를 알 수 없다. 앱이 실제로 떴다면
// 우리 화면은 백그라운드로 내려가므로(document.hidden) 그것만이 유일한 신호다.
function appDidOpen(timeout = 1800) {
  return new Promise((resolve) => {
    if (document.hidden) return resolve(true);
    let settled = false;
    const finish = (v) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVis);
      resolve(v);
    };
    const onVis = () => { if (document.hidden) finish(true); };
    const timer = setTimeout(() => finish(false), timeout);
    document.addEventListener('visibilitychange', onVis);
  });
}

// 초대 링크를 카카오톡으로 공유. 실제로 카카오톡이 열렸을 때만 true를 반환해
// 호출부가 "복사 후 붙여넣기"로 폴백할 수 있게 한다(예외를 던지지 않는다).
export async function shareToKakao({ title, description, link, imageUrl }) {
  try {
    const Kakao = await initKakao();
    if (!Kakao.Share?.sendDefault) return false;
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: imageUrl || SHARE_CARD_IMAGE,
        link: { mobileWebUrl: link, webUrl: link },
      },
      buttons: [
        { title: '함께하기', link: { mobileWebUrl: link, webUrl: link } },
      ],
    });
  } catch (e) {
    console.error('[kakao] share failed:', e);
    return false;
  }
  // 여기까지 왔어도 아직 성공이 아니다 — 카카오톡이 실제로 떴는지 확인해야 한다.
  return appDidOpen();
}
