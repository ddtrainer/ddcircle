// 앱이 맨 처음 로드될 때 URL에 ?invite=가 있었는지 — 모듈이 최초 평가되는 시점
// (React 렌더보다 먼저)에 한 번만 캡처한다. InviteUrlHandler가 마운트 직후
// history.replaceState로 ?invite=를 지워버리기 때문에, 그 뒤에 마운트되는
// 다른 컴포넌트(PiBrowserGate, InAppBrowserGate)가 window.location을 직접 보면
// 이미 지워진 상태만 보게 된다 — 그 레이스를 피하기 위한 값.
export const HAD_INVITE_PARAM_ON_LOAD = typeof window !== 'undefined' &&
  /[?&]invite=/.test(window.location.search);
