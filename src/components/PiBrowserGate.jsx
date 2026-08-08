import { useEffect, useState } from 'react';
import { isPiBrowser } from '../lib/piAuth';
import { HAD_INVITE_PARAM_ON_LOAD } from '../utils/inviteEntry';
import OpenInPiBrowserModal from './modals/OpenInPiBrowserModal';

// 초대 링크(?invite=)로 들어왔는데 Pi Browser 밖이면 안내 모달 — Pi 로그인은
// Pi Browser 안에서만 되기 때문에, 가능하면 거기로 유도한다. 세션당 1회만.
//
// App.jsx의 InviteUrlHandler가 마운트 직후 ?invite=를 history에서 지워버리므로,
// 원본 URL은 그보다 먼저(useState lazy init — 첫 렌더 중에 동기적으로 실행됨) 캡처해둔다.
const DISMISS_KEY = 'ddcircle.piGate.dismissed';

export default function PiBrowserGate() {
  const [originalHref] = useState(() => (
    typeof window !== 'undefined' ? window.location.href : ''
  ));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isPiBrowser()) return;
    if (!HAD_INVITE_PARAM_ON_LOAD) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch { /* ignore */ }
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [originalHref]);

  const handleClose = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <OpenInPiBrowserModal open={open} onClose={handleClose} targetUrl={originalHref} />
  );
}
