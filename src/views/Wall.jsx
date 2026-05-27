import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { FRIENDS, formatTimeAgo } from '../data/friends';
import { MOODS } from '../data/moods';
import { EXERCISES } from '../data/exercises';
import { findEncouragement, getEncouragementText } from '../data/encouragements';
import { fetchCircleFeed, fetchPublicFeed, normalizePost, deletePost } from '../lib/posts';
import { fetchFriends } from '../lib/friends';
import { fetchEmpathiesForPosts, toggleEmpathy } from '../lib/empathies';
import { fetchSentToday, fetchReceived, sendEncouragement as sendEncSupabase } from '../lib/encouragements';
import { fetchUserStatsBulk } from '../lib/stats';
import FeedCard from '../components/FeedCard';
import EncourageSheet from '../components/EncourageSheet';
import InviteModal from '../components/modals/InviteModal';
import styles from './Wall.module.css';

export default function Wall() {
  const { t, lang } = useLang();
  const { userPosts, sentEncouragements, sendEncouragement, todayDone, friendsVersion } = useApp();
  // 보낸 응원 localStorage 캐시 — AppContext 체인 타이밍 문제 우회, 직접 읽기/쓰기
  const [sentEncByPost, setSentEncByPost] = useState(() => {
    try {
      const raw = localStorage.getItem('ddcircle.sentEncByPost') || '{}';
      const parsed = JSON.parse(raw);
      console.log('[wall mount] sentEncByPost loaded from localStorage:', parsed);
      return parsed;
    } catch { return {}; }
  });
  // 안전장치: state 변경 시 localStorage 동기화
  useEffect(() => {
    try { localStorage.setItem('ddcircle.sentEncByPost', JSON.stringify(sentEncByPost)); } catch {}
  }, [sentEncByPost]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [remoteCircle, setRemoteCircle] = useState([]);
  const [remotePublic, setRemotePublic] = useState([]);
  const [remoteFriends, setRemoteFriends] = useState([]);
  const [empathies, setEmpathies] = useState({}); // { postId: { counts, byUser:Set } }
  // 오늘 보낸 응원: { byUser: {...}, byPost: {...} }
  // byUser → 친구 그리드(친구 1명별 오늘 응원), byPost → 게시물별 응원
  const [remoteEncMap, setRemoteEncMap] = useState({ byUser: {}, byPost: {} });
  // 본인이 받은 응원 (오늘): { [postId]: [{ encId, fromUserId, ts }, ...] }
  // 내 게시물 카드 아래에 친구들이 보낸 응원 메시지를 보여주기 위함
  const [receivedEncByPost, setReceivedEncByPost] = useState({});
  // 친구별 통계: { [userId]: { streak, last_session_date, today_ep } }
  const [friendStats, setFriendStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 피드 + 친구 + 공감 + 응원 일괄 로드
  const refresh = useCallback(async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const [circle, pub, friendsList, encMap, receivedRows] = await Promise.all([
        fetchCircleFeed(50),
        fetchPublicFeed(50),
        fetchFriends(user.id),
        fetchSentToday(user.id),
        fetchReceived(user.id, true),
      ]);
      const normCircle = circle.map(normalizePost);
      const normPublic = pub.map(normalizePost);
      setRemoteCircle(normCircle);
      setRemotePublic(normPublic);
      setRemoteFriends(friendsList);
      setRemoteEncMap(encMap);
      // 받은 응원을 post_id로 그룹핑 (post_id 없는 행 = friend 그리드용 응원은 제외)
      const receivedMap = {};
      for (const row of receivedRows) {
        if (!row.post_id) continue;
        (receivedMap[row.post_id] ||= []).push({
          encId: row.enc_id,
          fromUserId: row.from_user,
          ts: new Date(row.created_at).getTime(),
        });
      }
      setReceivedEncByPost(receivedMap);
      const allIds = [...new Set([...normCircle, ...normPublic].map((p) => p.id))];
      // 친구 통계 + 게시물 공감 병렬 로드
      const friendIds = (friendsList || []).map((f) => f.id);
      const [emp, stats] = await Promise.all([
        fetchEmpathiesForPosts(allIds, user.id),
        fetchUserStatsBulk(friendIds),
      ]);
      setEmpathies(emp);
      setFriendStats(stats);
    } catch (e) {
      console.error('[wall] refresh error:', e);
    } finally {
      if (showLoading) setLoading(false);
      setHasLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRemoteCircle([]);
      setRemotePublic([]);
      setRemoteFriends([]);
      setFriendStats({});
      setEmpathies({});
      setRemoteEncMap({ byUser: {}, byPost: {} });
      setReceivedEncByPost({});
      setHasLoaded(false);
      return;
    }
    refresh(friendsVersion > 0 ? false : true); // 초기 로드만 loading UI, 친구 갱신은 조용히
  }, [user, refresh, friendsVersion]);

  // 최신 게시물 ID + 친구 목록을 ref로 추적 (realtime 콜백 closure 문제 해결)
  const postIdsRef = useRef([]);
  useEffect(() => {
    postIdsRef.current = [...new Set([...remoteCircle, ...remotePublic].map((p) => p.id))];
  }, [remoteCircle, remotePublic]);

  const friendsRef = useRef([]);
  useEffect(() => {
    friendsRef.current = remoteFriends;
  }, [remoteFriends]);

  // Realtime 구독: 새 게시물 / 공감 변경 / 받은 응원
  useEffect(() => {
    if (!user) return;
    // 채널 이름에 랜덤값 포함 (같은 계정 다중 탭에서도 각자 구독)
    const channelName = `wall-${user.id}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'empathies' }, async () => {
        const allIds = postIdsRef.current;
        if (allIds.length === 0) return;
        const emp = await fetchEmpathiesForPosts(allIds, user.id);
        setEmpathies(emp);
      })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'encouragements', filter: `to_user=eq.${user.id}` },
        (payload) => {
          const encId = payload.new?.enc_id;
          const fromId = payload.new?.from_user;
          const postId = payload.new?.post_id;
          const createdAt = payload.new?.created_at;
          const sender = friendsRef.current.find((f) => f.id === fromId);
          const name = sender?.nickname || t('friendFallback');
          if (encId === 'nudge') {
            showToast('👋', t('nudgeReceivedToast', { name }));
            return;
          }
          // 게시물별 응원이면 상태에도 추가 — 새로고침 없이 즉시 카드 아래에 나타남
          if (postId) {
            setReceivedEncByPost((prev) => {
              const list = prev[postId] || [];
              if (list.some((r) => r.fromUserId === fromId && r.encId === encId)) return prev;
              return {
                ...prev,
                [postId]: [
                  ...list,
                  { encId, fromUserId: fromId, ts: createdAt ? new Date(createdAt).getTime() : Date.now() },
                ],
              };
            });
          }
          const enc = findEncouragement(encId);
          const text = getEncouragementText(encId, t) || t('encReceivedLabel');
          showToast(enc?.emoji || '💌', `${name} · ${text}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refresh]);

  // 공감 토글: 낙관적 UI 업데이트 후 Supabase에 반영
  const handleEmpathyToggle = async (postId, type) => {
    if (!user) return;
    setEmpathies((prev) => {
      const cur = prev[postId] || { counts: { sent: 0, great: 0, me: 0 }, byUser: new Set() };
      const has = cur.byUser.has(type);
      const nextBy = new Set(cur.byUser);
      if (has) nextBy.delete(type); else nextBy.add(type);
      const delta = has ? -1 : 1;
      return {
        ...prev,
        [postId]: {
          counts: { ...cur.counts, [type]: Math.max(0, cur.counts[type] + delta) },
          byUser: nextBy,
        },
      };
    });
    try {
      await toggleEmpathy(user.id, postId, type);
    } catch (e) {
      console.error('[empathy] toggle failed, reverting:', e?.message || e);
      // 롤백
      setEmpathies((prev) => {
        const cur = prev[postId];
        if (!cur) return prev;
        const has = cur.byUser.has(type);
        const nextBy = new Set(cur.byUser);
        if (has) nextBy.delete(type); else nextBy.add(type);
        const delta = has ? -1 : 1;
        return {
          ...prev,
          [postId]: {
            counts: { ...cur.counts, [type]: Math.max(0, cur.counts[type] + delta) },
            byUser: nextBy,
          },
        };
      });
    }
  };
  const { show: showToast } = useToast();
  const [tab, setTab] = useState('circle');
  const [highlightId, setHighlightId] = useState(null);
  const [nudged, setNudged] = useState({}); // { friendId: true }
  const [inviteOpen, setInviteOpen] = useState(false);
  // { id, name, postId? } — postId가 있으면 게시물별 응원, 없으면 친구별(데모/그리드용)
  const [encFriend, setEncFriend] = useState(null);
  const cardRefs = useRef({});

  const openEncourageFor = (friend) => {
    setEncFriend({ id: friend.id, name: lang === 'ko' ? friend.name : friend.enName });
  };

  const handleEncSelect = async (encId) => {
    if (!encFriend) return;
    // 로컬 응원 카운터 (legacy + 비인증 호환)
    sendEncouragement(encFriend.id, encId);
    const isCustom = typeof encId === 'string' && encId.startsWith('custom:');
    const enc = isCustom ? null : findEncouragement(encId);
    const displayText = isCustom ? encId.slice(7) : (enc ? t(enc.textKey) : '');
    showToast(enc?.emoji || '💌', `${t('encToastSent')} · ${displayText}`);
    // 인증된 유저 + 실제 친구(UUID)면 Supabase에도 저장
    if (user && typeof encFriend.id === 'string' && encFriend.id.length > 20) {
      try {
        await sendEncSupabase(user.id, encFriend.id, encId, encFriend.postId || null);
        const entry = { encId, ts: Date.now() };
        setRemoteEncMap((m) => ({
          byUser: { ...m.byUser, [encFriend.id]: entry },
          byPost: encFriend.postId
            ? { ...m.byPost, [encFriend.postId]: entry }
            : m.byPost,
        }));
        if (encFriend.postId) {
          const postId = encFriend.postId;
          const newEntry = { encId, ts: Date.now() };
          // 1) localStorage 즉시 동기 쓰기 (React 업데이트 큐와 무관하게 보장)
          try {
            const cur = JSON.parse(localStorage.getItem('ddcircle.sentEncByPost') || '{}');
            cur[postId] = newEntry;
            localStorage.setItem('ddcircle.sentEncByPost', JSON.stringify(cur));
            console.log('[enc] saved to localStorage:', postId, newEntry);
          } catch (err) {
            console.error('[enc] localStorage write failed:', err);
          }
          // 2) React 상태 갱신 (현재 화면 즉시 반영)
          setSentEncByPost((prev) => ({ ...prev, [postId]: newEntry }));
        }
      } catch (e) {
        // DB 저장 실패 — 사용자에게 알림 + 친구는 응원을 못 받았다는 사실 명시
        console.error('[encouragement] save failed:', e);
        showToast('⚠️', t('encSendFailedToast'));
      }
    }
    setEncFriend(null);
  };

  // 인증 시: 실제 친구 데이터 (Supabase) + 친구별 user_stats 결합
  // 비인증: 데모 FRIENDS
  const todayDateStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  // 인증된 사용자만 실제 친구 데이터. 비로그인 사용자에게는 빈 배열 →
  // 데모 친구(지현, 민준 등)를 더 이상 보여주지 않음. 출시 후 첫인상에서
  // 가짜 친구가 깔리는 문제 방지.
  const friendList = user
    ? remoteFriends.map((f) => {
        const s = friendStats[f.id];
        return {
          id: f.id,
          name: f.nickname,
          enName: f.nickname,
          emoji: f.emoji || '🌸',
          emoji_bg: f.emoji_bg || 'linear-gradient(135deg,#fbb040,#f97b9c)',
          color: null,
          streak: s?.streak || 0,
          done: s?.last_session_date === todayDateStr,
          isRemote: true,
        };
      })
    : [];

  const doneFriends = friendList.filter((f) => f.done);
  const pendingFriends = friendList.filter((f) => !f.done);
  // 오늘 내 서클에서 완료한 사람 수 — 친구들 + 본인(오늘 완료했으면)
  const todayCircleCount = doneFriends.length + (todayDone ? 1 : 0);

  const scrollToFriend = (id) => {
    const el = cardRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 1500);
  };

  const sendNudge = async (friend) => {
    if (nudged[friend.id]) return;
    setNudged((prev) => ({ ...prev, [friend.id]: true }));
    const name = lang === 'ko' ? friend.name : friend.enName;
    showToast('💌', name + t('nudgeSent'));
    // 실제 친구(UUID)면 Supabase encouragements에 nudge 저장
    if (user && typeof friend.id === 'string' && friend.id.length > 20) {
      try {
        await sendEncSupabase(user.id, friend.id, 'nudge');
      } catch (e) {
        console.error('[nudge] save failed:', e);
      }
    }
  };

  // 본인 게시물 삭제 (서버 + 옵티미스틱 UI)
  const handleDeletePost = async (post) => {
    if (!post?.id) return;
    const ok = window.confirm(t('deleteConfirm'));
    if (!ok) return;

    // 옵티미스틱 — UI에서 즉시 제거
    const filterFn = (p) => p.id !== post.id;
    setRemoteCircle((prev) => prev.filter(filterFn));
    setRemotePublic((prev) => prev.filter(filterFn));

    if (post.isRemote) {
      // Supabase 삭제 (DB + Storage)
      const result = await deletePost(post.id, post.proofUrl);
      if (!result.ok) {
        showToast('⚠️', t('deleteError'));
        // 실패 시 새로고침 트리거 — 가장 안전한 롤백
        try {
          const [normCircle, normPublic] = await Promise.all([
            fetchCircleFeed(50).then((r) => r.map(normalizePost)),
            fetchPublicFeed(50).then((r) => r.map(normalizePost)),
          ]);
          setRemoteCircle(normCircle);
          setRemotePublic(normPublic);
        } catch { /* ignore */ }
        return;
      }
      showToast('🗑️', t('deleteSuccess'));
    } else {
      // 로컬 게시물 — AppContext의 userPosts에서 제거 필요시 후속 작업
      showToast('🗑️', t('deleteSuccess'));
    }
  };

  const displayName = (f) => (lang === 'ko' ? f.name : f.enName);

  // 인증 상태면 원격 피드 우선, 아니면 로컬
  // 본인 'private'도 본인 피드엔 표시 (카드에 자물쇠 표식으로 식별)
  const myCirclePosts = user ? remoteCircle : userPosts;

  const renderMyPost = (post) => {
    const mood = MOODS.find((m) => m.id === post.mood);
    const exercise = EXERCISES.find((e) => e.key === post.exerciseId);
    const minutesAgo = Math.max(0, Math.floor((Date.now() - post.ts) / 60000));
    const timeStr = minutesAgo < 1 ? t('justNow') : formatTimeAgo(minutesAgo, lang);
    const exerciseLabel = exercise ? t('ex' + exercise.i18n) : '';
    // 본인 게시물 vs 친구 게시물 구분 (원격일 때만 의미)
    const isMine = !post.userId || post.userId === user?.id;
    const profile = post.profile;
    const emp = user ? empathies[post.id] : null;
    const controlledCounts = emp?.counts;
    const controlledActive = emp
      ? { sent: emp.byUser.has('sent'), great: emp.byUser.has('great'), me: emp.byUser.has('me') }
      : undefined;

    // 친구 게시물에만 응원 보내기 활성화 (본인 게시물에는 응원 못 보냄)
    // 응원은 게시물별로 추적 — 같은 친구의 다른 게시물에 별도로 응원 가능
    const friendUserId = !isMine ? post.userId : null;
    const sentEncRemote = friendUserId ? remoteEncMap.byPost?.[post.id] : null;
    const sentEncLocal = friendUserId ? sentEncByPost?.[post.id] : null;
    // 더 최신 ts 우선 — 메시지 변경 시 local이 DB보다 먼저 갱신될 수 있음
    const sentEnc = (() => {
      if (sentEncLocal && sentEncRemote) {
        return (sentEncLocal.ts || 0) >= (sentEncRemote.ts || 0) ? sentEncLocal : sentEncRemote;
      }
      return sentEncLocal || sentEncRemote;
    })();
    const sentEncDisplay = sentEnc ? getEncouragementText(sentEnc.encId, t) : '';
    const handleEncourageFriend = friendUserId && user
      ? () => setEncFriend({ id: friendUserId, name: profile?.nickname || '', postId: post.id })
      : undefined;

    // 내 게시물이면 — 친구들이 보낸 응원 메시지 리스트
    const receivedList = isMine
      ? (receivedEncByPost[post.id] || []).map((r) => {
          const sender = remoteFriends.find((f) => f.id === r.fromUserId);
          return {
            encId: r.encId,
            text: getEncouragementText(r.encId, t),
            fromName: sender?.nickname || t('friendFallback'),
            fromEmoji: sender?.emoji || '🌸',
            fromEmojiBg: sender?.emoji_bg || 'linear-gradient(135deg,#fbb040,#f97b9c)',
          };
        })
      : [];

    return (
      <FeedCard
        key={post.id}
        variant={isMine ? 'mine' : 'friend'}
        avatarUrl={profile?.avatar_url || null}
        emoji={profile?.emoji || (isMine ? '✨' : '🌸')}
        emojiBg={profile?.emoji_bg || (isMine ? 'linear-gradient(135deg,#f47730,#1e9bd8)' : 'linear-gradient(135deg,#fbb040,#f97b9c)')}
        name={isMine ? t('mineLabel') : (profile?.nickname || '')}
        meta={`${timeStr}${exerciseLabel ? ' · ' + exerciseLabel : ''}`}
        tag={mood ? t(mood.key) : null}
        message={post.msg || ''}
        proof={post.hasProof ? { url: post.proofUrl } : null}
        initialEmpathy={{ sent: 0, great: 0, me: 0 }}
        controlledCounts={controlledCounts}
        controlledActive={controlledActive}
        onEmpathyToggle={user ? (key) => handleEmpathyToggle(post.id, key) : undefined}
        onDelete={isMine ? () => handleDeletePost(post) : undefined}
        onEncourage={handleEncourageFriend}
        encouraged={!!sentEnc}
        encouragedText={sentEncDisplay}
        receivedList={receivedList}
        isPrivate={isMine && post.target === 'private'}
      />
    );
  };

  return (
    <div className={styles.wall}>
      <div className={styles.header}>
        <div className={styles.title}>{t('wallTitle')}</div>
        <div className={styles.headerRight}>
          <span className={styles.count}>
            {t('todayPrefix')} {todayCircleCount}{t('peopleSuffix')}
          </span>
          <button
            className={styles.inviteBtn}
            onClick={() => setInviteOpen(true)}
          >
            <span className={styles.inviteIcon}>➕</span>
            {t('inviteLabel')}
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'circle' ? styles.active : ''}`}
          onClick={() => setTab('circle')}
        >
          💙 {t('myCircleTab')}{' '}
          <span className={styles.badge}>{todayCircleCount}</span>
        </button>
        <button
          className={`${styles.tab} ${tab === 'public' ? styles.active : ''}`}
          onClick={() => setTab('public')}
        >
          🌍 {t('globalCircleTab')}
        </button>
      </div>

      {/* 로딩 인디케이터 */}
      {loading && !hasLoaded && (
        <div className={styles.loading}>
          <div className={styles.spinner}>🌿</div>
          <div className={styles.loadingText}>{t('loadingFeed')}</div>
        </div>
      )}

      {/* 내 서클 탭 */}
      {tab === 'circle' && (!loading || hasLoaded) && (
        <div>
          {/* 비로그인 — 로그인 유도 카드만 표시 (데모 친구·게시물 제거) */}
          {!user ? (
            <div className={styles.inviteCta}>
              <div className={styles.inviteCtaIcon}>💙</div>
              <div className={styles.inviteCtaTitle}>{t('wallLoginCtaTitle')}</div>
              <div className={styles.inviteCtaSub}>{t('wallLoginCtaSub')}</div>
              <button
                className={styles.inviteCtaBtn}
                onClick={() => navigate('/login')}
              >
                {t('wallLoginCtaBtn')}
              </button>
            </div>
          ) : (
          <>
          {/* 친구 0명일 때 초대 CTA */}
          {user && hasLoaded && friendList.length === 0 ? (
            <div className={styles.inviteCta}>
              <div className={styles.inviteCtaIcon}>💙</div>
              <div className={styles.inviteCtaTitle}>{t('inviteCtaTitle')}</div>
              <div className={styles.inviteCtaSub}>{t('inviteCtaSub')}</div>
              <button
                className={styles.inviteCtaBtn}
                onClick={() => setInviteOpen(true)}
              >
                {t('inviteCtaBtn')}
              </button>
            </div>
          ) : (
          <div className={styles.friendsStatus}>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <div className={`${styles.summaryNum} ${styles.done}`}>{doneFriends.length}</div>
                <div className={styles.summaryLabel}>{t('todayDoneLabel')}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={`${styles.summaryNum} ${styles.pending}`}>{pendingFriends.length}</div>
                <div className={styles.summaryLabel}>{t('notYetLabel')}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryNum}>{friendList.length}</div>
                <div className={styles.summaryLabel}>{t('totalFriendsLabel')}</div>
              </div>
            </div>

            <div className={styles.grid}>
              {friendList.map((f) => (
                <div
                  key={f.id}
                  className={styles.cell}
                  onClick={() => scrollToFriend(f.id)}
                >
                  <div
                    className={`${styles.avatar} ${f.done ? styles.done : styles.pending}`}
                    style={{ background: f.emoji_bg || `linear-gradient(135deg,${f.color})` }}
                  >
                    {f.emoji}
                    {f.done && <span className={styles.checkIcon}>✓</span>}
                  </div>
                  <div className={styles.fName}>{displayName(f)}</div>
                  {f.streak > 0 && <div className={styles.streak}>🔥 {f.streak}</div>}
                </div>
              ))}
              {/* 친구 초대 (+) 셀 */}
              <div
                className={styles.cell}
                onClick={() => setInviteOpen(true)}
              >
                <div className={`${styles.avatar} ${styles.add}`}>+</div>
                <div className={styles.fName} style={{ color: 'var(--text-muted)' }}>
                  {t('inviteLabel')}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 내 게시물 (최신 위) */}
          {user && hasLoaded && myCirclePosts.length === 0 && (
            <div className={styles.emptyCard}>
              <div className={styles.emptyEmoji}>💙</div>
              <div className={styles.emptyTitle}>{t('wallCircleEmptyTitle')}</div>
              <div className={styles.emptySub}>{t('wallCircleEmptySub')}</div>
            </div>
          )}
          {myCirclePosts.map(renderMyPost)}
          </>
          )}
        </div>
      )}

      {/* 글로벌 서클 탭 */}
      {tab === 'public' && (!loading || hasLoaded) && (
        <div>
          {/* 비로그인 — 로그인 유도 (데모 글로벌 게시물 제거) */}
          {!user ? (
            <div className={styles.inviteCta}>
              <div className={styles.inviteCtaIcon}>🌍</div>
              <div className={styles.inviteCtaTitle}>{t('wallLoginCtaTitle')}</div>
              <div className={styles.inviteCtaSub}>{t('wallLoginCtaSub')}</div>
              <button
                className={styles.inviteCtaBtn}
                onClick={() => navigate('/login')}
              >
                {t('wallLoginCtaBtn')}
              </button>
            </div>
          ) : (
            <>
              {hasLoaded && remotePublic.length === 0 && (
                <div className={styles.emptyCard}>
                  <div className={styles.emptyEmoji}>🌍</div>
                  <div className={styles.emptyTitle}>{t('wallPublicEmptyTitle')}</div>
                  <div className={styles.emptySub}>{t('wallPublicEmptySub')}</div>
                </div>
              )}
              {remotePublic.map(renderMyPost)}
            </>
          )}
        </div>
      )}

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <EncourageSheet
        open={!!encFriend}
        friendName={encFriend?.name}
        onSelect={handleEncSelect}
        onClose={() => setEncFriend(null)}
      />
    </div>
  );
}
