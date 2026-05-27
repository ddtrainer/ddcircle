import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage, useSessionStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { recordSession, migrateLocalStats } from '../lib/stats';
import { recordStakeDeclared, resolveStakeWon, resolveStakeForfeited, cancelStake } from '../lib/challenges';
import { findChallenge } from '../data/challenges';
import { calculateEarnedEp } from '../utils/ep';
import { DEFAULT_CUSTOM_BREATH } from '../data/breathPatterns';
import { evaluateChallenges } from '../data/challenges';

const AppContext = createContext(null);

// 신규 사용자의 첫인상 — 모두 0에서 시작 (실제 활동으로 채워짐)
// 데모 값을 두면 로그인 직후 "12일 연속 1247 EP" 가짜 카드가 보이다가
// 0으로 바뀌어 신뢰가 깨짐.
const DEFAULT_USER_EP = {
  total: 0,
  today: 0,
  thisMonth: 0,
  streak: 0,
  empathySent: 0,
  empathyReceived: 0,
};

const DEFAULT_SET_TIMING = {
  morning: { time: '07:30', enabled: true },
  evening: { time: '19:00', enabled: true },
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
  // 실제 오늘 활동 인원 수 — 서버에서 fetch될 때까지 0 (가짜 247 노출 방지)
  const [todayCount, setTodayCount] = useLocalStorage('ddcircle.todayCount', 0);
  const [todayDone, setTodayDone] = useLocalStorage('ddcircle.todayDone', false);
  // 오늘 세션 횟수 (EP 캡용) — 날짜가 바뀌면 자동 리셋
  const [todaySessions, setTodaySessions] = useLocalStorage('ddcircle.todaySessions', { date: '', count: 0 });
  const [localInviteCode] = useLocalStorage('ddcircle.inviteCode', generateInviteCode());
  // 인증된 유저는 프로필의 실제 invite_code 사용
  const inviteCode = profile?.invite_code || localInviteCode;
  const [userPosts, setUserPosts] = useLocalStorage('ddcircle.userPosts', []);
  const [breathPatternId, setBreathPatternId] = useLocalStorage('ddcircle.breathPatternId', '478');
  const [customBreath, setCustomBreath] = useLocalStorage('ddcircle.customBreath', DEFAULT_CUSTOM_BREATH);
  const [challengeClaims, setChallengeClaims] = useLocalStorage('ddcircle.challengeClaims', {});
  const [challengeJoins, setChallengeJoins] = useLocalStorage('ddcircle.challengeJoins', {});
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('ddcircle.notificationsEnabled', true);
  const [sentEncouragements, setSentEncouragements] = useLocalStorage('ddcircle.sentEncouragements', {});
  // postId 기준 보낸 응원 캐시 — 네비게이션 후에도 '보냄' 상태 유지
  const [sentEncByPost, setSentEncByPost] = useLocalStorage('ddcircle.sentEncByPost', {});

  // 친구에게 한 줄 응원 보내기 — friendId별 마지막 보낸 메시지 저장
  const sendEncouragement = useCallback((friendId, encId) => {
    setSentEncouragements((prev) => ({
      ...prev,
      [friendId]: { encId, ts: Date.now() },
    }));
    // 통계: 보낸 응원 카운터 + 1
    setUserEp((prev) => ({ ...prev, empathySent: (prev.empathySent || 0) + 1 }));
  }, [setSentEncouragements, setUserEp]);

  // DB 저장 성공 후 호출 — postId 기준으로 보낸 응원을 localStorage에 캐싱
  const markPostEncouraged = useCallback((postId, encId) => {
    if (!postId) return;
    setSentEncByPost((prev) => ({ ...prev, [postId]: { encId, ts: Date.now() } }));
  }, [setSentEncByPost]);
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

  // 챌린지 약속 — 보증 EP 차감 + startStreak 기록
  // 반환: { ok: true } 또는 { ok: false, reason: 'insufficient_ep' }
  const joinChallenge = useCallback((challengeId) => {
    const ch = findChallenge(challengeId);
    if (!ch) return { ok: false, reason: 'unknown_challenge' };
    const stakeEp = ch.stakeEp || 0;
    if (stakeEp > 0 && userEp.total < stakeEp) {
      return { ok: false, reason: 'insufficient_ep', needed: stakeEp };
    }
    setChallengeJoins((prev) => ({
      ...prev,
      [challengeId]: { joinedAt: Date.now(), startStreak: userEp.streak, stakedEp: stakeEp },
    }));
    if (stakeEp > 0) {
      setUserEp((prev) => ({ ...prev, total: Math.max(0, prev.total - stakeEp) }));
    }
    if (user) {
      recordStakeDeclared(user.id, challengeId, stakeEp, userEp.streak)
        .catch((e) => console.error('[challenges] declare error:', e));
    }
    return { ok: true, stakeEp };
  }, [userEp.streak, userEp.total, setChallengeJoins, setUserEp, user]);

  // 챌린지 자발적 포기 — 보증 EP는 회수됨 (반환 안 됨)
  const leaveChallenge = useCallback((challengeId) => {
    setChallengeJoins((prev) => {
      const next = { ...prev };
      delete next[challengeId];
      return next;
    });
    if (user) {
      cancelStake(user.id, challengeId).catch((e) => console.error('[challenges] cancel error:', e));
    }
  }, [setChallengeJoins, user]);

  // 받은 초대 (URL ?invite=xxx로 진입 시 설정됨)
  const [pendingInvite, setPendingInvite] = useState(null);

  // 친구 관계 변경 시 Wall이 리프레시하도록 알리는 카운터
  const [friendsVersion, setFriendsVersion] = useState(0);
  const bumpFriendsVersion = useCallback(() => setFriendsVersion((v) => v + 1), []);

  // 세션 진행 중 상태 — sessionStorage에 보존 (새로고침/백그라운드 복귀에도 살아남음)
  // selectedExercise가 휘발되면 completeSession이 exercise_id를 null로 저장해
  // Record의 활동 기록이 비어 보이는 문제 발생.
  const [selectedExercise, setSelectedExercise] = useSessionStorage(
    'ddcircle.session.exercise', 'jog'
  );

  // 장기 선호 운동 — Picker에서 선택할 때마다 저장됨.
  // 기본값 'jog'(제자리 뛰기) — 첫 사용자도 chip에 즉시 노출 + Picker 자동 스킵.
  // 사용자는 Countdown 화면의 "변경"으로 언제든 다른 운동 선택 가능.
  const [preferredExercise, setPreferredExercise] = useLocalStorage(
    'ddcircle.preferredExercise', 'jog'
  );
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

    // Dash/Deep 완주 여부 — DashSession/DeepSession이 sessionStorage에 기록
    let dashFully = false, deepFully = false;
    try {
      dashFully = sessionStorage.getItem('ddcircle.session.dashFully') === '1';
      deepFully = sessionStorage.getItem('ddcircle.session.deepFully') === '1';
    } catch { /* defaults */ }

    // 오늘 세션 카운트 (날짜 바뀌면 0부터)
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayCountForCap = todaySessions.date === dateStr ? todaySessions.count : 0;

    // streak — 완주가 하나라도 있어야 인정 (둘 다 skip이면 streak 증가 X)
    const sessionCounts = dashFully || deepFully;
    const newStreak = sessionCounts ? userEp.streak + 1 : userEp.streak;

    const baseEarned = calculateEarnedEp({
      dashFully, deepFully, hasProof, shared,
      streak: newStreak,
      todaySessionCount: todayCountForCap,
    });

    // 챌린지 평가 — 달성 시 보증+보너스 환급, 실패 시 보증 소각
    const { newClaims, newJoins, bonusEp, stakeRefund, stakeForfeited, completed, forfeited } = evaluateChallenges(
      newStreak, challengeClaims, challengeJoins
    );
    setChallengeClaims(newClaims);
    setChallengeJoins(newJoins);
    if (completed.length > 0) {
      setLastChallengeBonus({ challenges: completed, bonusEp, stakeRefund, ts: Date.now() });
    }
    // Supabase에 stake 상태 동기화
    if (user) {
      completed.forEach((ch) => resolveStakeWon(user.id, ch.id).catch(() => {}));
      forfeited.forEach((ch) => resolveStakeForfeited(user.id, ch.id).catch(() => {}));
    }

    // 캡 도달 시 챌린지 보너스/환급도 0으로 (정책: "오늘 EP는 더 이상 안 쌓임")
    const capReached = todayCountForCap >= 2;
    const total = capReached ? 0 : baseEarned + bonusEp + stakeRefund;

    setUserEp((prev) => ({
      ...prev,
      total: prev.total + total,
      today: prev.today + total,
      thisMonth: prev.thisMonth + total,
      streak: newStreak,
    }));
    if (sessionCounts) {
      setTodayDone(true);
      setTodayCount((c) => c + 1);
    }
    // 오늘 세션 카운트 증가 (캡 추적용 — 완주 여부와 무관, 세션 진행 자체 카운트)
    setTodaySessions({ date: dateStr, count: todayCountForCap + 1 });
    // 세션 완료 시 슬롯별 충족 기록 — 아침 세션을 했다고 저녁 알림까지 막으면 안 됨.
    // 현재 시각이 슬롯 시간 -10분 ~ +30분 범위에 들면 그 슬롯만 충족 처리.
    try {
      if (sessionCounts) {
        const slotsConfig = [];
        if (setTiming.morning?.enabled) slotsConfig.push({ id: 'morning', time: setTiming.morning.time });
        if (setTiming.evening?.enabled) slotsConfig.push({ id: 'evening', time: setTiming.evening.time });
        if (slotsConfig.length === 0) {
          slotsConfig.push({ id: 'default-morning', time: '09:00' });
          slotsConfig.push({ id: 'default-evening', time: '18:00' });
        }
        const raw = localStorage.getItem('ddcircle.slotsSatisfied');
        const satisfied = {};
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          // 오늘 날짜 항목만 유지 (어제 이전은 자동 폐기)
          Object.keys(parsed).forEach((k) => { if (parsed[k] === dateStr) satisfied[k] = dateStr; });
        } catch { /* reset */ }
        const nowMs = today.getTime();
        for (const s of slotsConfig) {
          const [h, m] = s.time.split(':').map(Number);
          const sm = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0, 0).getTime();
          const diff = nowMs - sm;
          if (diff >= -10 * 60 * 1000 && diff <= 30 * 60 * 1000) {
            satisfied[s.id] = dateStr;
          }
        }
        localStorage.setItem('ddcircle.slotsSatisfied', JSON.stringify(satisfied));
      }
    } catch { /* ignore */ }

    // 다음 세션을 위해 완주 플래그 비움
    try {
      sessionStorage.removeItem('ddcircle.session.dashFully');
      sessionStorage.removeItem('ddcircle.session.deepFully');
    } catch { /* ignore */ }

    // 인증된 유저는 Supabase에 기록. save 프라미스를 반환해서 호출자가
    // 실패를 사용자에게 알릴 수 있도록 함 (이전엔 fire-and-forget이라 DB가
    // 실패해도 사용자는 "+10 EP" 토스트 보고 성공한 줄 알았음).
    const save = user
      ? recordSession(user.id, {
          earnedEp: total,
          hasProof,
          shared,
          exerciseId: selectedExercise,
          breathId: breathPatternId,
          newStreak,
        })
      : Promise.resolve();

    return {
      earned: total,
      save,
      capReached,           // UI에서 "오늘 EP 캡 도달" 안내용
      dashFully, deepFully, // UI에서 "Skip해서 EP 일부만" 안내용
    };
  }, [userEp.streak, challengeClaims, challengeJoins, setUserEp, setTodayDone, setTodayCount, setChallengeClaims, setChallengeJoins, user, selectedExercise, breathPatternId, todaySessions, setTodaySessions, setTiming]);

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
        preferredExercise,
        setPreferredExercise,
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
        sentEncByPost,
        markPostEncouraged,
        lastChallengeBonus,
        consumeLastChallengeBonus,
        todaySessions,
        inviteCode,
        inviteLink: `${typeof window !== 'undefined' ? window.location.origin : 'https://ddcircle.vercel.app'}/?invite=${inviteCode}`,
        pendingInvite,
        setPendingInvite,
        friendsVersion,
        bumpFriendsVersion,
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
