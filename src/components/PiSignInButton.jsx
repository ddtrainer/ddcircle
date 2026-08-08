import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { usePiAuth } from '../context/PiAuthContext';
import { isPiBrowser } from '../lib/piAuth';
import OpenInPiBrowserModal from './modals/OpenInPiBrowserModal';

// Pi 로그인 버튼 — Pi Browser 안에서는 항상 클릭 가능(제스처 로그인). 검증 중
// "Waiting for sign-in"에 사용자가 직접 눌러 실제 Pi 로그인을 완료할 수 있도록
// 비활성화하지 않는다. Pi Browser 밖(일반 브라우저)에서는 Pi.authenticate()를
// 직접 부르지 않는다 — 응답할 네이티브 Pi Browser가 없어 완료되지 않는 수락 화면만
// 뜨기 때문에, 대신 Pi Browser로 이동하라는 안내 모달을 띄운다.
const base = {
  fontSize: 12,
  fontWeight: 800,
  fontFamily: 'inherit',
  padding: '5px 10px',
  borderRadius: 999,
  cursor: 'pointer',
  border: 'none',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  color: '#fff',
  background: 'linear-gradient(135deg, #7b3ff2, #b06ab3)',
  // 좁은 화면에서 긴 Pi 사용자명이 다른 버튼을 밀어내지 않도록 말줄임
  maxWidth: '32vw',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flexShrink: 0,
};

export default function PiSignInButton() {
  const { t } = useLang();
  const { piUser, status, signInWithPi } = usePiAuth();
  const [showPiGate, setShowPiGate] = useState(false);

  const label =
    status === 'authenticated' && piUser ? `π ${piUser.username}` :
    status === 'loading' ? t('piSigningIn') :
    t('piSignIn');

  const handleClick = () => {
    if (isPiBrowser()) {
      signInWithPi();
    } else {
      setShowPiGate(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Sign in with Pi"
        style={base}
      >
        {label}
      </button>
      <OpenInPiBrowserModal
        open={showPiGate}
        onClose={() => setShowPiGate(false)}
        targetUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </>
  );
}
