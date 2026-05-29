import { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { MAX_LEVEL, getMultiplier } from '../lib/ddLevel';

const LevelContext = createContext(null);

const clampLevel = (n) => Math.min(MAX_LEVEL, Math.max(1, Number(n) || 1));

// Deep/Dash 현재 레벨 상태. localStorage가 기본 저장소이고,
// 로그인 시 Supabase user_levels와 동기화(원격 우선 로드 → 변경 시 업서트).
export function LevelProvider({ children }) {
  const { user } = useAuth();
  const [deepLevel, setDeepLevelRaw] = useLocalStorage('ddcircle.deepLevel', 1);
  const [dashLevel, setDashLevelRaw] = useLocalStorage('ddcircle.dashLevel', 1);

  // 원격 로드가 끝나기 전 로컬 변경이 원격을 덮어쓰지 않도록 가드
  const remoteLoadedRef = useRef(false);

  // 로그인되면 원격 레벨 로드 (없으면 현재 로컬값으로 row 생성)
  useEffect(() => {
    if (!user) {
      remoteLoadedRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('user_levels')
        .select('deep_level, dash_level')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('[level] load error:', error);
        remoteLoadedRef.current = true;
        return;
      }
      if (data) {
        setDeepLevelRaw(clampLevel(data.deep_level));
        setDashLevelRaw(clampLevel(data.dash_level));
      } else {
        await supabase.from('user_levels').insert({
          user_id: user.id,
          deep_level: clampLevel(deepLevel),
          dash_level: clampLevel(dashLevel),
        });
      }
      remoteLoadedRef.current = true;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 원격 업서트 (로그인 + 원격 로드 완료 후에만)
  const syncRemote = useCallback((next) => {
    if (!user || !remoteLoadedRef.current) return;
    supabase
      .from('user_levels')
      .upsert(
        { user_id: user.id, deep_level: next.deep, dash_level: next.dash, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .then(({ error }) => { if (error) console.error('[level] sync error:', error); });
  }, [user]);

  const setDeepLevel = useCallback((lvl) => {
    const v = clampLevel(lvl);
    setDeepLevelRaw(v);
    syncRemote({ deep: v, dash: clampLevel(dashLevel) });
  }, [dashLevel, syncRemote, setDeepLevelRaw]);

  const setDashLevel = useCallback((lvl) => {
    const v = clampLevel(lvl);
    setDashLevelRaw(v);
    syncRemote({ deep: clampLevel(deepLevel), dash: v });
  }, [deepLevel, syncRemote, setDashLevelRaw]);

  // 가이드 열람 기록 (로그인 시에만 원격 저장 — 비로그인은 no-op)
  const recordGuideView = useCallback((track, level) => {
    if (!user) return;
    supabase
      .from('guide_views')
      .insert({ user_id: user.id, track, level: clampLevel(level) })
      .then(({ error }) => { if (error) console.error('[level] guide view error:', error); });
  }, [user]);

  const value = {
    deepLevel: clampLevel(deepLevel),
    dashLevel: clampLevel(dashLevel),
    setDeepLevel,
    setDashLevel,
    recordGuideView,
    deepMultiplier: getMultiplier('deep', clampLevel(deepLevel)),
    dashMultiplier: getMultiplier('dash', clampLevel(dashLevel)),
  };

  return <LevelContext.Provider value={value}>{children}</LevelContext.Provider>;
}

export function useLevel() {
  const ctx = useContext(LevelContext);
  if (!ctx) throw new Error('useLevel must be used within LevelProvider');
  return ctx;
}
