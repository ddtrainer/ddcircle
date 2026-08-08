import { useEffect, useState } from 'react';
import { isInAppBrowser } from '../utils/inAppBrowser';
import { isPiBrowser } from '../lib/piAuth';
import OpenExternalModal from './modals/OpenExternalModal';

// 앱 진입 시 인앱 브라우저(카톡·네이버·페북 등)면 1회 안내 모달
// 세션당 1회만 — 사용자가 "여기서 계속 보기" 누르면 그 세션 동안 다시 안 띄움
const DISMISS_KEY = 'ddcircle.iab.dismissed';
const PI_BANNER_DISMISS_KEY = 'ddcircle.piBanner.dismissed';

export default function InAppBrowserGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isInAppBrowser()) return;
    // 이 모달은 "일반 브라우저(크롬)로 여세요"라고 안내하는데, 우리가 우선 유도하려는 곳은
    // Pi Browser다(로그인·기록 저장이 거기서만 된다). 그래서 Pi Browser 배너가 아직 떠
    // 있는 동안은 이 모달을 띄우지 않는다 — 서로 반대되는 안내가 겹치면 혼란만 준다.
    // 사용자가 배너를 닫아 "여기서 계속"을 택한 뒤에야 차선책으로 안내한다.
    if (!isPiBrowser()) {
      try {
        if (sessionStorage.getItem(PI_BANNER_DISMISS_KEY) !== '1') return;
      } catch { return; }
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch { /* ignore */ }
    // 첫 화면 그리고 나서 살짝 뒤에 — 깜빡임 줄임
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
  };

  return <OpenExternalModal open={open} onClose={handleClose} reason="banner" />;
}
