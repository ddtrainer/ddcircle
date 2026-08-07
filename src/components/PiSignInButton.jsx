import { usePiAuth } from '../context/PiAuthContext';

// Pi 로그인 버튼 — 항상 클릭 가능(제스처 로그인). 검증 중 "Waiting for sign-in"에
// 사용자가 직접 눌러 실제 Pi 로그인을 완료할 수 있도록 비활성화하지 않는다.
const base = {
  fontSize: 13,
  fontWeight: 800,
  fontFamily: 'inherit',
  padding: '7px 12px',
  borderRadius: 999,
  cursor: 'pointer',
  border: 'none',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  color: '#fff',
  background: 'linear-gradient(135deg, #7b3ff2, #b06ab3)',
};

export default function PiSignInButton() {
  const { piUser, status, signInWithPi } = usePiAuth();

  const label =
    status === 'authenticated' && piUser ? `π ${piUser.username}` :
    status === 'loading' ? 'Pi 로그인 중…' :
    'Pi로 로그인';

  return (
    <button
      type="button"
      onClick={signInWithPi}
      aria-label="Sign in with Pi"
      style={base}
    >
      {label}
    </button>
  );
}
