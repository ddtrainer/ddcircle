import { useEffect, useState } from 'react';
import { isInAppBrowser } from '../utils/inAppBrowser';
import { HAD_INVITE_PARAM_ON_LOAD } from '../utils/inviteEntry';
import OpenExternalModal from './modals/OpenExternalModal';

// 앱 진입 시 인앱 브라우저(카톡·네이버·페북 등)면 1회 안내 모달
// 세션당 1회만 — 사용자가 "여기서 계속 보기" 누르면 그 세션 동안 다시 안 띄움
const DISMISS_KEY = 'ddcircle.iab.dismissed';

export default function InAppBrowserGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isInAppBrowser()) return;
    // 초대 링크(?invite=)로 들어온 경우엔 PiBrowserGate가 Pi Browser로 바로 유도하므로
    // 여기서 또 다른 안내 모달을 겹쳐 띄우지 않는다.
    if (HAD_INVITE_PARAM_ON_LOAD) return;
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
