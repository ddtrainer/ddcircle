import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authenticateWithPi, verifyWithBackend } from '../lib/piAuth';

const PiAuthContext = createContext(null);

// Pi 인증 상태 관리 + 앱 로드 시 자동 트리거.
// status: 'idle' | 'loading' | 'authenticated' | 'error' | 'unavailable'
export function PiAuthProvider({ children }) {
  const [piUser, setPiUser] = useState(null); // 백엔드(/me) 검증 완료된 { uid, username }
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // 항상 재호출 가능 — Pi.authenticate는 사용자 제스처(버튼 클릭)로 다시 부를 수 있어야
  // 검증기가 "Waiting for sign-in" 동안 실제 로그인을 감지한다. (락으로 막지 않음)
  const signInWithPi = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const auth = await authenticateWithPi();                    // Pi.init(await) → authenticate(['username'])
      const { user } = await verifyWithBackend(auth.accessToken); // 백엔드가 /me로 검증 후 세션 수립
      setPiUser(user);
      setStatus('authenticated');
    } catch (e) {
      console.error('[pi-auth]', e);
      setError(e);
      setStatus(/unavailable|Pi Browser/i.test(e.message || '') ? 'unavailable' : 'error');
    }
  }, []);

  // 앱 로드 시 1회 자동 인증 시도 (Pi 검증이 감지하도록 항상 실행)
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    signInWithPi();
  }, [signInWithPi]);

  const signOut = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch { /* ignore */ }
    setPiUser(null);
    setStatus('idle');
  }, []);

  const value = { piUser, status, error, signInWithPi, signOut };
  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>;
}

export function usePiAuth() {
  const ctx = useContext(PiAuthContext);
  if (!ctx) throw new Error('usePiAuth must be used within PiAuthProvider');
  return ctx;
}
