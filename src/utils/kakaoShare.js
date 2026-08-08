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
// 핵심: Pi Browser는 우리 앱을 cross-origin iframe으로 감싼다. 이 안에서
//  · window.open(스킴, '_blank') → 빈 탭만 열리고 앱은 안 뜬다(반환값은 truthy라
//    실패를 감지할 수도 없다). wa.me·t.me가 window.open으로 됐던 건 그건 https라
//    새 탭이 정상 로드되고 Android App Link가 앱으로 넘겨줬기 때문 — 카카오톡은
//    그런 공개 웹 주소가 없어 커스텀 스킴을 써야 한다.
//  · window.location(자식 프레임) = 스킴 → 크로스오리진 하위 프레임에서 외부
//    프로토콜을 여는 건 브라우저가 더 강하게 막는다.
//  · window.top.location = 스킴 → '사용자 제스처가 있는 최상위 네비게이션'이라
//    브라우저가 허용하는 패턴이다. 스킴은 페이지를 언로드하지 않으므로, 앱이 뜨면
//    Pi Browser는 그대로 남는다. (설정은 크로스오리진 부모라도 허용 — 읽기만 막힘)
// 미설치 시엔 아무 일도 안 일어나게 두고(스토어로 튕기지 않게) 복사된 문구로 안내한다.
export function openKakaoTalkApp() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const url = /android/i.test(ua)
    ? 'intent://#Intent;scheme=kakaotalk;package=com.kakao.talk;end'
    : 'kakaotalk://';
  try {
    window.top.location.href = url;
  } catch {
    // 최상위 접근이 막힌 예외 상황 — 자식 프레임으로라도 시도
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
