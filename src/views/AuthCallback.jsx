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

    // onAuthStateChange가 URL fragment 토큰 처리 후 가장 먼저 발화됨
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      goNext(session);
    });

    // 이미 세션이 있는 경우(새로고침 등) 즉시 처리
    supabase.auth.getSession().then(({ data: { session } }) => {
      goNext(session);
    });

    // 3초 내에 세션을 못 받으면 로그인으로
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
