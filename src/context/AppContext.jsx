import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { recordSession, migrateLocalStats } from '../lib/stats';
import { calculateEarnedEp } from '../utils/ep';
import { DEFAULT_CUSTOM_BREATH } from '../data/breathPatterns';
import { evaluateChallenges } from '../data/challenges';

const AppContext = createContext(null);

const DEFAULT_USER_EP = {
  total: 1247,
  today: 54,
  thisMonth: 632,
  streak: 12,
  empathySent: 87,
  empathyReceived: 14,
};

const DEFAULT_SET_TIMING = {
  morning: { time: '07:30', enabled: true },
  evening: { time: '19:00', enabled: true },
  sync: true,
};

// 사용자 고유 초대 링크 (실제로는 가입 시 서버에서 생성)
// 데모: 첫 방문 시 랜덤 코드 생성하여 localStorage 저장
function generateInviteCode() {
  return 'gangsan-' + Math.random().toString(36).slice(2, 8);
}

export function AppProvider({ children }) {
  const { profile, user } = useAuth();
  const [userEp, setUserEp] = useLocalStorage('ddcircle.userEp', DEFAULT_USER_EP);
  const [setTiming, setSetTiming] = useLocalStorage('ddcircle.setTiming', DEFAULT_SET_TIMING);
  const [todayCount, setTodayCount] = useLocalStorage('ddcircle.todayCount', 247);
  const [todayDone, setTodayDone] = useLocalStorage('ddcircle.todayDone', false);
  const [localInviteCode] = useLocalStorage('ddcircle.inviteCode', generateInviteCode());
  // 인증된 유저는 프로필의 실제 invite_code 사용
  const inviteCode = profile?.invite_code || localInviteCode;
  const [userPosts, setUserPosts] = useLocalStorage('ddcircle.userPosts', []);
  const [breathPatternId, setBreathPatternId] = useLocalStorage('ddcircle.breathPatternId', '478');
  const [customBreath, setCustomBreath] = useLocalStorage('ddcircle.customBreath', DEFAULT_CUSTOM_BREATH);
  const [challengeClaims, setChallengeClaims] = useLocalStorage('ddcircle.challengeClaims', {});
  const [challengeJoins, setChallengeJoins] = useLocalStorage('ddcircle.challengeJoins', {});
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('ddcircle.notificationsEnabled', false);
  const [sentEncouragements, setSentEncouragements] = useLocalStorage('ddcircle.sentEncouragements', {});

  // 친구에게 한 줄 응원 보내기 — friendId별 마지막 보낸 메시지 저장
  const sendEncouragement = useCallback((friendId, encId) => {
    setSentEncouragements((prev) => ({
      ...prev,
      [friendId]: { encId, ts: Date.now() },
    }));
    // 통계: 보낸 응원 카운터 + 1
    setUserEp((prev) => ({ ...prev, empathySent: (prev.empathySent || 0) + 1 }));
  }, [setSentEncouragements, setUserEp]);
  const [lastChallengeBonus, setLastChallengeBonus] = useState(null);

  // === 일회성 마이그레이션: 자동 모드 시절의 challenge 기록 정리 ===
  // 이전 버전에서는 streak가 target에 도달하면 자동으로 claim 처리되었음.
  // 이제 명시적 참여 모델로 변경되었으므로, 이전에 자동으로 쌓인 claim/join 기록을
  // 한 번 비워서 사용자가 새 opt-in UI에서 깨끗하게 시작할 수 있게 함.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const MIGRATION_KEY = 'ddcircle.challengeMigrationV2';
    if (!localStorage.getItem(MIGRATION_KEY)) {
      setChallengeClaims({});
      setChallengeJoins({});
      localStorage.setItem(MIGRATION_KEY, '1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 인증 직후 localStorage userEp → user_stats 1회 마이그레이션
  useEffect(() => {
    if (!user) return;
    const flagKey = `ddcircle.statsMigrated.${user.id}`;
    if (localStorage.getItem(flagKey)) return;
    migrateLocalStats(user.id, userEp).then(() => {
      localStorage.setItem(flagKey, '1');
    }).catch((e) => console.error('[stats] migration error:', e));
    // userEp 변경마다 다시 실행되지 않도록 user.id만 의존성
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 챌린지 참여 — 현재 streak를 기준점으로 기록
  const joinChallenge = useCallback((challengeId) => {
    setChallengeJoins((prev) => ({
      ...prev,
      [challengeId]: { joinedAt: Date.now(), startStreak: userEp.streak },
    }));
  }, [userEp.streak, setChallengeJoins]);

  // 챌린지 참여 취소
  const leaveChallenge = useCallback((challengeId) => {
    setChallengeJoins((prev) => {
      const next = { ...prev };
      delete next[challengeId];
      return next;
    });
  }, [setChallengeJoins]);

  // 받은 초대 (URL ?invite=xxx로 진입 시 설정됨)
  const [pendingInvite, setPendingInvite] = useState(null);

  // 세션 휘발성 상태 (현재 진행 중인 3분 플로우 — localStorage X)
  const [selectedExercise, setSelectedExercise] = useState('jumping-jack');
  const proofBlobRef = useRef(null);
  const [proofUrl, setProofUrl] = useState(null);

  const setProofBlob = useCallback((blob) => {
    // 기존 URL 해제
    if (proofUrl) {
      try { URL.revokeObjectURL(proofUrl); } catch {}
    }
    proofBlobRef.current = blob;
    setProofUrl(blob ? URL.createObjectURL(blob) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proofUrl]);

  // 3분 플로우 완료 시 EP 보상 + 통계 갱신 + 챌린지 보너스 처리
  const completeSession = useCallback(({ shared }) => {
    const hasProof = !!proofBlobRef.current;
    const newStreak = userEp.streak + 1;
    const baseEarned = calculateEarnedEp({ hasProof, shared, streak: newStreak });

    // 챌린지 평가 (참여 중인 것만) — 새로 달성한 챌린지의 보너스 EP 합산
    const { newClaims, newJoins, bonusEp, completed } = evaluateChallenges(
      newStreak, challengeClaims, challengeJoins
    );
    setChallengeClaims(newClaims);
    setChallengeJoins(newJoins);
    if (completed.length > 0) {
      setLastChallengeBonus({ challenges: completed, bonusEp, ts: Date.now() });
    }

    const total = baseEarned + bonusEp;

    setUserEp((prev) => ({
      ...prev,
      total: prev.total + total,
      today: prev.today + total,
      thisMonth: prev.thisMonth + total,
      streak: newStreak,
    }));
    setTodayDone(true);
    setTodayCount((c) => c + 1);

    // 인증된 유저는 Supabase에 기록 (fire-and-forget)
    if (user) {
      recordSession(user.id, {
        earnedEp: total,
        hasProof,
        shared,
        exerciseId: null, // selectedExercise를 여기서 못 받아서 일단 null
        breathId: null,
        newStreak,
      }).catch((e) => console.error('[stats] recordSession failed:', e));
    }
    return total;
  }, [userEp.streak, challengeClaims, challengeJoins, setUserEp, setTodayDone, setTodayCount, setChallengeClaims, setChallengeJoins, user]);

  // 챌린지 보너스 알림을 소비(읽음 처리)
  const consumeLastChallengeBonus = useCallback(() => setLastChallengeBonus(null), []);

  // 공감 나누기 — 내 게시물 추가
  const addUserPost = useCallback((data) => {
    const post = {
      id: Date.now(),
      ts: Date.now(),
      mood: data.mood || null,
      msg: data.msg || '',
      target: data.target || 'circle',
      exerciseId: data.exerciseId || null,
      proofUrl: data.proofUrl || null,
      hasProof: !!data.proofUrl,
    };
    setUserPosts((prev) => [post, ...prev].slice(0, 50));
    return post.id;
  }, [setUserPosts]);

  return (
    <AppContext.Provider
      value={{
        userEp,
        setUserEp,
        setTiming,
        setSetTiming,
        todayCount,
        todayDone,
        selectedExercise,
        setSelectedExercise,
        proofUrl,
        getProofBlob: () => proofBlobRef.current,
        setProofBlob,
        completeSession,
        userPosts,
        addUserPost,
        breathPatternId,
        setBreathPatternId,
        customBreath,
        setCustomBreath,
        challengeClaims,
        challengeJoins,
        joinChallenge,
        leaveChallenge,
        notificationsEnabled,
        setNotificationsEnabled,
        sentEncouragements,
        sendEncouragement,
        lastChallengeBonus,
        consumeLastChallengeBonus,
        inviteCode,
        inviteLink: `${typeof window !== 'undefined' ? window.location.origin : 'https://ddcircle.vercel.app'}/?invite=${inviteCode}`,
        pendingInvite,
        setPendingInvite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
