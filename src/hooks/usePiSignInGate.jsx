import { useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { isPiBrowser } from '../lib/piAuth';
import OpenInPiBrowserModal from '../components/modals/OpenInPiBrowserModal';

// Pi 로그인을 트리거하는 공통 동작.
//  · Pi Browser 안 → 바로 Pi.authenticate() 실행
//  · Pi Browser 밖 → "Pi Browser로 열기" 안내 모달 (일반 브라우저에선 인증이 완료될 수
//    없으므로 직접 부르지 않는다)
// 헤더의 Pi 로그인 버튼과 응원나라의 로그인 유도 카드가 정확히 같은 동작을 하도록,
// 이 로직을 한곳에 모아 양쪽에서 쓴다(한쪽만 바뀌는 불일치 방지).
//
// 반환: { triggerSignIn, gate }
//  triggerSignIn — 클릭 핸들러에서 호출
//  gate          — 컴포넌트가 반드시 렌더해야 하는 안내 모달 엘리먼트
export function usePiSignInGate() {
  const { signInWithPi } = usePiAuth();
  const [showGate, setShowGate] = useState(false);

  const triggerSignIn = () => {
    if (isPiBrowser()) signInWithPi();
    else setShowGate(true);
  };

  const gate = (
    <OpenInPiBrowserModal
      open={showGate}
      onClose={() => setShowGate(false)}
      targetUrl={typeof window !== 'undefined' ? window.location.href : ''}
    />
  );

  return { triggerSignIn, gate };
}
