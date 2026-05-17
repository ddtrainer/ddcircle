import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// 인증 상태: { user, profile, loading, signInWithKakao, signOut, refreshProfile }
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    // 프로필 로딩 중에는 loading=true로 — ProfileGuard가 nickname null 상태에서
    // 성급하게 /profile-setup으로 보내는 레이스를 막음 (OAuth 콜백 직후 특히)
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.error('[auth] profile load error:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 세션 + 인증 변경 구독
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        // loadProfile이 내부에서 loading=false로 마무리하므로 별도 .finally 불필요
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithKakao = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // 카카오 동의 항목 명시 — Supabase 기본값에 포함된 profile_image 제외
        // (DDCircle은 이모지 아바타 사용, 카카오 프로필 사진 불필요)
        scopes: 'profile_nickname account_email',
      },
    });
    if (error) {
      console.error('[auth] kakao sign-in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(() => {
    if (session?.user) return loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    loading,
    isAuthenticated: !!session?.user,
    signInWithKakao,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
