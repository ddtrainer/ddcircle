import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authenticateWithPi, verifyWithBackend, isPiBrowser } from '../lib/piAuth';

const PiAuthContext = createContext(null);

// Pi 인증 상태 관리 + 앱 로드 시 자동 트리거.
// status: 'idle' | 'loading' | 'authenticated' | 'error' | 'unavailable'
export function PiAuthProvider({ children }) {
  const [piUser, setPiUser] = useState(null); // 백엔드(/me) 검증 완료된 { uid, username }
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const signInWithPi = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
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
    } finally {
      inFlight.current = false;
    }
  }, []);

  // 앱 로드 시 1회 자동 인증 시도 — Pi Browser 환경에서만 (일반 웹은 무영향)
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    if (!isPiBrowser()) { setStatus('unavailable'); return; }
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
