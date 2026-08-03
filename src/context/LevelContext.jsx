import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { supabase } from '../lib/supabase';
import { MAX_LEVEL, getMultiplier, highestUnlockedLevel } from '../lib/ddLevel';
import LevelUpModal from '../components/modals/LevelUpModal';

const LevelContext = createContext(null);

const clampLevel = (n) => Math.min(MAX_LEVEL, Math.max(1, Number(n) || 1));

// Deep/Dash 현재 레벨 상태. localStorage가 기본 저장소이고,
// 로그인 시 Supabase user_levels와 동기화(원격 우선 로드 → 변경 시 업서트).
export function LevelProvider({ children }) {
  const { user } = useAuth();
  const { userEp } = useApp();
  const streak = userEp?.streak ?? 0;
  const totalEp = userEp?.total ?? 0;
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

  // 레벨업 축하 모달 큐 — Deep/Dash가 동시에 오르면 하나씩 순서대로 보여준다.
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const enqueueLevelUp = useCallback((track, level) => {
    setLevelUpQueue((q) =>
      q.some((x) => x.track === track && x.level === level) ? q : [...q, { track, level }]
    );
  }, []);

  // 자동 승급 — 연속일·누적EP가 다음 레벨 잠금 해제 조건을 충족하면 레벨을 올린다.
  // 절대 강등되지 않음(Math.max): 스트릭이 끊겨도 한 번 도달한 레벨은 유지된다.
  // 이 효과가 "입문 요건을 다 채웠는데 입문에 머무르는" 버그의 실제 수정점이다.
  // (기존엔 checkLevelUp으로 '레벨업 가능!' 뱃지만 띄우고 실제 승급은 누구도 호출하지 않았음.)
  // 승급이 일어나면 축하 모달 큐에 넣는다.
  useEffect(() => {
    const cur = clampLevel(deepLevel);
    const target = Math.max(cur, highestUnlockedLevel('deep', { streak, totalEp }));
    if (target > cur) {
      setDeepLevel(target);
      enqueueLevelUp('deep', target);
    }
  }, [streak, totalEp, deepLevel, setDeepLevel, enqueueLevelUp]);

  // v2.2: Dash 레벨 체계 폐지 → Dash 자동 승급 없음. (dashLevel 상태·저장값은 남기되 미사용)
  // Dash는 "오늘 완료 여부"만 스트릭에 반영되고, EP는 종목 배율로 계산된다.

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

  const currentLevelUp = levelUpQueue[0] || null;
  const dismissLevelUp = useCallback(() => setLevelUpQueue((q) => q.slice(1)), []);

  return (
    <LevelContext.Provider value={value}>
      {children}
      <LevelUpModal
        open={!!currentLevelUp}
        track={currentLevelUp?.track || 'deep'}
        level={currentLevelUp?.level || 1}
        onClose={dismissLevelUp}
      />
    </LevelContext.Provider>
  );
}

export function useLevel() {
  const ctx = useContext(LevelContext);
  if (!ctx) throw new Error('useLevel must be used within LevelProvider');
  return ctx;
}
