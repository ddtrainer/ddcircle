// 초대 링크 등으로 앱에 들어온 사람을 가능하면 Pi Browser로 보낸다 — Pi 로그인은
// Pi Browser 안에서만 동작하기 때문. Pi Browser가 없으면 지금 쓰던 브라우저(Chrome/Safari)
// 그대로 계속 쓰게 두고, 절대 막지 않는다.
//
// Android는 카카오톡→Chrome 점프에 쓰는 것과 같은 Intent URI 기법을 그대로 재사용 —
// Pi Browser(패키지명 pi.browser, Google Play 등록 확인됨)가 설치돼 있으면 그리로,
// 없으면 S.browser_fallback_url로 자동 폴백된다.
//
// iOS는 Pi Browser가 pi:// 스킴을 자체 페이지 이동에 쓰는 것은 확인되지만(pi://develop.pi 등),
// 외부 URL을 그 스킴에 실어 보내는 공식 규격은 공개돼 있지 않다. 그래서 자동 리다이렉트는
// 하지 않고, 사용자가 직접 버튼을 눌렀을 때만 시도한다 — 실패해도 그냥 아무 일도 안 일어날 뿐,
// 페이지는 그대로 남아 있어 안전하다.
import { isAndroid, isIOS } from './inAppBrowser';

export const PI_BROWSER_PACKAGE = 'pi.browser';
export const PI_BROWSER_STORE_ANDROID = 'https://play.google.com/store/apps/details?id=pi.browser';
export const PI_BROWSER_STORE_IOS = 'https://apps.apple.com/app/id1560911608';

export function canAutoJumpToPiBrowser() {
  return isAndroid();
}

// Android — 설치돼 있으면 Pi Browser로 이동, 없으면 url 자체(기본 브라우저)로 자동 폴백.
export function openInPiBrowserAndroid(url) {
  if (!isAndroid()) return false;
  try {
    const noScheme = url.replace(/^https?:\/\//, '');
    const intent =
      `intent://${noScheme}#Intent;scheme=https;package=${PI_BROWSER_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(url)};end`;
    location.href = intent;
    return true;
  } catch {
    return false;
  }
}

// iOS — 검증되지 않은 최선 시도. 실패해도 조용히 무시됨(현재 페이지 그대로 유지).
export function tryPiSchemeIOS(url) {
  if (!isIOS()) return false;
  try {
    location.href = 'pi://' + url.replace(/^https?:\/\//, '');
    return true;
  } catch {
    return false;
  }
}

export function piBrowserStoreUrl() {
  return isIOS() ? PI_BROWSER_STORE_IOS : PI_BROWSER_STORE_ANDROID;
}
