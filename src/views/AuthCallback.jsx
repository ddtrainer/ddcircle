import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// OAuth 리다이렉트 후 도착하는 페이지
// Supabase가 URL fragment에서 토큰을 추출해 자동으로 세션을 만들어줌
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let navigated = false;

    const goNext = (session) => {
      if (navigated) return;
      navigated = true;
      if (session) {
        const setupDone = localStorage.getItem(`ddcircle.setup.${session.user.id}`);
        navigate(setupDone ? '/' : '/profile-setup', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    // PKCE: URL의 ?code=... 를 명시적으로 세션으로 교환
    // (detectSessionInUrl=true면 자동도 되지만, 명시 호출이 PWA 컨텍스트에서
    // 더 안정적이고 실패 시 로깅도 가능)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            console.error('[auth] code exchange failed:', error);
            goNext(null);
          } else {
            goNext(data.session);
          }
        })
        .catch((e) => {
          console.error('[auth] code exchange threw:', e);
          goNext(null);
        });
      return; // exchangeCodeForSession 결과로만 진행
    }

    // 코드가 없으면 — 기존 세션 확인 또는 인증 변경 대기
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      goNext(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      goNext(session);
    });

    const fallback = setTimeout(() => goNext(null), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigate]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 32 }}>🌿</div>
      <div>로그인 처리 중...</div>
    </div>
  );
}
