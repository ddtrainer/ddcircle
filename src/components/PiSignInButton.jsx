import { usePiAuth } from '../context/PiAuthContext';
import { isPiBrowser } from '../lib/piAuth';

// Pi 수동 로그인 버튼 — 자동 트리거와 별개로 사용자가 직접 재시도할 수 있게.
const base = {
  fontSize: 13,
  fontWeight: 800,
  fontFamily: 'inherit',
  padding: '7px 12px',
  borderRadius: 999,
  cursor: 'pointer',
  border: '1px solid var(--border)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

export default function PiSignInButton() {
  const { piUser, status, signInWithPi } = usePiAuth();

  // 일반 웹 브라우저에선 노출하지 않음 (Pi Browser 전용)
  if (!isPiBrowser()) return null;

  if (status === 'authenticated' && piUser) {
    return (
      <span style={{ ...base, background: 'var(--surface2, #fdf9f0)', color: 'var(--text)', cursor: 'default' }}>
        π {piUser.username}
      </span>
    );
  }

  const label =
    status === 'loading' ? 'Pi 연결 중…' :
    status === 'unavailable' ? 'Pi Browser에서 로그인' :
    'Pi로 로그인';

  return (
    <button
      type="button"
      onClick={signInWithPi}
      disabled={status === 'loading'}
      aria-label="Sign in with Pi"
      style={{
        ...base,
        color: '#fff',
        border: 'none',
        background: 'linear-gradient(135deg, #7b3ff2, #b06ab3)',
        opacity: status === 'loading' ? 0.7 : 1,
      }}
    >
      {label}
    </button>
  );
}
