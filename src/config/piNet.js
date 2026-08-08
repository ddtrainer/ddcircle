// PiNet 주소 — Pi 개발자 포털에서 발급받는 *.pinet.com 서브도메인.
//
// pinet.com은 Pi Network 소유 도메인이고, Pi Browser가 이 도메인을 App Link(안드로이드)/
// Universal Link(iOS)로 등록해두었다. 그래서 텔레그램·카카오톡 등 어디에서 링크를 눌러도
// OS가 브라우저를 거치지 않고 Pi Browser 앱으로 바로 연결해준다 — 앱 코드가 관여할 여지가
// 없는 OS 레벨 동작이라 가장 확실하다.
//
// 반대로 우리 도메인(ddcircle.app)으로 링크를 보내면 OS 입장에선 Pi Browser를 열 이유가
// 없으므로 일반 브라우저로 열린다. intent:// 같은 수동 점프는 텔레그램 웹뷰 등에서 조용히
// 무시되는 경우가 많아 대안이 되지 못한다.
//
// [발급처] Pi 개발자 포털(Pi Browser에서 develop.pi) → DDCircle → Application Checklist의
// "PiNet Subdomain" 항목. 도메인 스쿼팅 방지를 위해 뒤에 임의 문자열이 붙는다.
export const PINET_URL = import.meta.env.VITE_PINET_URL || 'https://ddcirclezr3425.pinet.com';

// 공유/초대 링크의 기준 주소. PiNet 주소가 있으면 항상 그것을 우선한다.
// (Pi Browser 안에서 ddcircle.app으로 보고 있더라도, 남에게 보내는 링크는 PiNet이어야
//  받는 사람 기기에서 Pi Browser로 열린다 — 그래서 window.location.origin을 쓰지 않는다)
export function shareBaseUrl() {
  if (PINET_URL) return PINET_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://www.ddcircle.app';
}
