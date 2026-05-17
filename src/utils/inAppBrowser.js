// 인앱 브라우저(카카오톡/네이버/페북/인스타/라인 등) 감지 + 외부 브라우저로 점프
//
// 인앱 웹뷰는 Web Share API(특히 파일 공유)와 PWA 설치를 차단해서
// 사용자가 카드 공유 / 홈 화면 추가를 할 수 없음. 외부 브라우저(Chrome/Safari)로
// 보내는 게 유일한 해결.

const UA_RE = /kakaotalk|fb_iab|fbav|instagram|line|naver|everytimeapp|whale|daumapps/i;

export function getUA() {
  return (typeof navigator !== 'undefined' && navigator.userAgent) || '';
}

export function isInAppBrowser() {
  return UA_RE.test(getUA());
}

export function isAndroid() {
  return /android/i.test(getUA());
}

export function isIOS() {
  const ua = getUA();
  // iPad on iOS 13+ reports MacIntel — touch 지원 여부로 보정
  return /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);
}

export function inAppBrand() {
  const ua = getUA().toLowerCase();
  if (ua.includes('kakaotalk')) return 'kakaotalk';
  if (ua.includes('naver')) return 'naver';
  if (ua.includes('instagram')) return 'instagram';
  if (ua.includes('fb_iab') || ua.includes('fbav')) return 'facebook';
  if (ua.includes('line')) return 'line';
  if (ua.includes('whale')) return 'whale';
  if (ua.includes('daumapps')) return 'daum';
  if (ua.includes('everytimeapp')) return 'everytime';
  return 'unknown';
}

// 현재 페이지를 외부 브라우저에서 열기 시도
// 반환: 'opened' (점프 시도함) | 'unsupported' (점프 불가, 사용자에게 수동 안내 필요)
export function openInExternalBrowser(url) {
  const target = url || (typeof location !== 'undefined' ? location.href : 'https://www.ddcircle.app');
  const brand = inAppBrand();

  // iOS는 OS 정책상 자동 점프 불가 — Chrome 설치돼 있으면 googlechromes:// 가 동작은 하지만
  // 보장되지 않음. 안내 모달로 처리.
  if (isIOS()) return 'unsupported';

  if (isAndroid()) {
    try {
      if (brand === 'kakaotalk') {
        // 카카오톡 안드로이드 공식 scheme — 시스템 기본 브라우저로 점프
        location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(target);
        return 'opened';
      }
      // 그 외 안드로이드 인앱 — Chrome으로 강제 점프 (Android Intent URI)
      // Chrome 설치돼 있지 않으면 폴백 URL로 이동
      const noScheme = target.replace(/^https?:\/\//, '');
      const intent =
        `intent://${noScheme}#Intent;scheme=https;package=com.android.chrome;` +
        `S.browser_fallback_url=${encodeURIComponent(target)};end`;
      location.href = intent;
      return 'opened';
    } catch {
      return 'unsupported';
    }
  }
  return 'unsupported';
}

// 라벨용 — 토스트/모달 안내 텍스트에 사용
export function brandLabel(brand) {
  const map = {
    kakaotalk: '카카오톡', naver: '네이버앱', instagram: 'Instagram',
    facebook: 'Facebook', line: 'LINE', whale: '웨일', daum: '다음앱',
    everytime: '에브리타임', unknown: '인앱 브라우저',
  };
  return map[brand] || map.unknown;
}
