import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { FRIENDS, formatTimeAgo } from '../data/friends';
import { MOODS } from '../data/moods';
import { EXERCISES } from '../data/exercises';
import { findEncouragement } from '../data/encouragements';
import { fetchCircleFeed, fetchPublicFeed, normalizePost } from '../lib/posts';
import { fetchFriends } from '../lib/friends';
import { fetchEmpathiesForPosts, toggleEmpathy } from '../lib/empathies';
import { fetchSentToday, sendEncouragement as sendEncSupabase } from '../lib/encouragements';
import FeedCard from '../components/FeedCard';
import EncourageSheet from '../components/EncourageSheet';
import InviteModal from '../components/modals/InviteModal';
import styles from './Wall.module.css';

export default function Wall() {
  const { t, lang } = useLang();
  const { userPosts, sentEncouragements, sendEncouragement } = useApp();
  const { user } = useAuth();
  const [remoteCircle, setRemoteCircle] = useState([]);
  const [remotePublic, setRemotePublic] = useState([]);
  const [remoteFriends, setRemoteFriends] = useState([]);
  const [empathies, setEmpathies] = useState({}); // { postId: { counts, byUser:Set } }
  const [remoteEncMap, setRemoteEncMap] = useState({}); // { toUserId: {encId, ts} }
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 피드 + 친구 + 공감 + 응원 일괄 로드
  const refresh = useCallback(async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const [circle, pub, friendsList, encMap] = await Promise.all([
        fetchCircleFeed(50),
        fetchPublicFeed(50),
        fetchFriends(user.id),
        fetchSentToday(user.id),
      ]);
      const normCircle = circle.map(normalizePost);
      const normPublic = pub.map(normalizePost);
      setRemoteCircle(normCircle);
      setRemotePublic(normPublic);
      setRemoteFriends(friendsList);
      setRemoteEncMap(encMap);
      const allIds = [...new Set([...normCircle, ...normPublic].map((p) => p.id))];
      const emp = await fetchEmpathiesForPosts(allIds, user.id);
      setEmpathies(emp);
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
      setEmpathies({});
      setRemoteEncMap({});
      setHasLoaded(false);
      return;
    }
    refresh(true); // 초기 로드에만 loading UI
  }, [user, refresh]);

  // 최신 게시물 ID를 ref로 추적 (realtime 콜백 closure 문제 해결)
  const postIdsRef = useRef([]);
  useEffect(() => {
    postIdsRef.current = [...new Set([...remoteCircle, ...remotePublic].map((p) => p.id))];
  }, [remoteCircle, remotePublic]);

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
          if (encId === 'nudge') {
            showToast('👋', t('nudgeReceivedToast'));
            return;
          }
          const enc = findEncouragement(encId);
          showToast(enc?.emoji || '💌', t(enc?.textKey) || t('encReceivedLabel'));
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
  const [encFriend, setEncFriend] = useState(null); // { id, name } 현재 응원 시트의 대상
  const cardRefs = useRef({});

  const openEncourageFor = (friend) => {
    setEncFriend({ id: friend.id, name: lang === 'ko' ? friend.name : friend.enName });
  };

  const handleEncSelect = async (encId) => {
    if (!encFriend) return;
    // 로컬 응원 카운터 (legacy + 비인증 호환)
    sendEncouragement(encFriend.id, encId);
    const enc = findEncouragement(encId);
    showToast(enc?.emoji || '💌', `${t('encToastSent')} · ${t(enc?.textKey)}`);
    // 인증된 유저 + 실제 친구(UUID)면 Supabase에도 저장
    if (user && typeof encFriend.id === 'string' && encFriend.id.length > 20) {
      try {
        await sendEncSupabase(user.id, encFriend.id, encId);
        setRemoteEncMap((m) => ({ ...m, [encFriend.id]: { encId, ts: Date.now() } }));
      } catch (e) {
        console.error('[encouragement] save failed:', e);
      }
    }
    setEncFriend(null);
  };

  // 인증 시: 실제 친구 데이터 (Supabase) / 비인증: 데모 FRIENDS
  const friendList = user
    ? remoteFriends.map((f) => ({
        id: f.id,
        name: f.nickname,
        enName: f.nickname,
        emoji: f.emoji || '🌸',
        emoji_bg: f.emoji_bg || 'linear-gradient(135deg,#fbb040,#f97b9c)',
        color: null,
        streak: 0,
        done: false,
        isRemote: true,
      }))
    : FRIENDS;

  const doneFriends = friendList.filter((f) => f.done);
  const pendingFriends = friendList.filter((f) => !f.done);
  const todayCircleCount = doneFriends.length;

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

  const displayName = (f) => (lang === 'ko' ? f.name : f.enName);

  // 인증 상태면 원격 피드 우선, 아니면 로컬
  const myCirclePosts = user
    ? remoteCircle
    : userPosts.filter((p) => p.target !== 'private');

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
    return (
      <FeedCard
        key={post.id}
        variant={isMine ? 'mine' : 'friend'}
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
      />
    );
  };

  return (
    <div className={styles.wall}>
      <div className={styles.header}>
        <div className={styles.title}>{t('wallTitle')}</div>
        <div className={styles.headerRight}>
          <span className={styles.count}>
            {t('todayPrefix')} 23{t('peopleSuffix')}
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

          {/* 내 게시물 (최신 위) */}
          {user && hasLoaded && myCirclePosts.length === 0 && (
            <div className={styles.emptyCard}>
              <div className={styles.emptyEmoji}>💙</div>
              <div className={styles.emptyTitle}>{t('wallCircleEmptyTitle')}</div>
              <div className={styles.emptySub}>{t('wallCircleEmptySub')}</div>
            </div>
          )}
          {myCirclePosts.map(renderMyPost)}

          {/* 친구 피드 (완료한 친구들) — 데모 FRIENDS만 (비인증 시) */}
          {!user && doneFriends.map((f) => {
            const sent = sentEncouragements[f.id];
            const sentEnc = sent ? findEncouragement(sent.encId) : null;
            return (
              <FeedCard
                key={f.id}
                variant="friend"
                cardRef={(el) => { cardRefs.current[f.id] = el; }}
                highlighted={highlightId === f.id}
                emoji={f.emoji}
                emojiBg={`linear-gradient(135deg,${f.color})`}
                name={displayName(f)}
                meta={`${formatTimeAgo(f.time, lang)} · ${t('dayLabel')} ${f.streak} · ${t('ex' + f.exerciseKey)}`}
                tag={t(f.moodLabel)}
                message={t(f.msgKey)}
                proof={f.hasProof ? { url: null } : null}
                initialEmpathy={{ sent: f.id * 3 + 5, great: f.id * 2 + 2, me: f.id + 1 }}
                onEncourage={() => openEncourageFor(f)}
                encouraged={!!sent}
                encouragedText={sentEnc ? t(sentEnc.textKey) : ''}
              />
            );
          })}

          {/* 아직 안 한 친구들 - nudge 카드 (비인증 시만 데모) */}
          {!user && pendingFriends.map((f) => {
            const sent = !!nudged[f.id];
            return (
              <div
                key={f.id}
                ref={(el) => { cardRefs.current[f.id] = el; }}
                className={`${styles.nudgeCard} ${highlightId === f.id ? styles.highlighted : ''}`}
              >
                <div className={styles.nudgeTop}>
                  <div className={styles.user}>
                    <div
                      className={styles.avatarSmall}
                      style={{ background: `linear-gradient(135deg,${f.color})`, opacity: 0.6 }}
                    >
                      {f.emoji}
                    </div>
                    <div>
                      <div className={styles.nameSoft}>{displayName(f)}</div>
                      <div className={styles.meta}>
                        {t('pendingDays')} {f.streak}
                      </div>
                    </div>
                  </div>
                  <div className={styles.tagGold}>{t('waitingTag')}</div>
                </div>
                <button
                  className={`${styles.nudgeBtn} ${sent ? styles.sent : ''}`}
                  onClick={() => sendNudge(f)}
                  disabled={sent}
                >
                  {sent ? t('nudgeBtnSent') : t('nudgeBtnPre')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 글로벌 서클 탭 */}
      {tab === 'public' && (!loading || hasLoaded) && (
        <div>
          {user && hasLoaded && remotePublic.length === 0 && (
            <div className={styles.emptyCard}>
              <div className={styles.emptyEmoji}>🌍</div>
              <div className={styles.emptyTitle}>{t('wallPublicEmptyTitle')}</div>
              <div className={styles.emptySub}>{t('wallPublicEmptySub')}</div>
            </div>
          )}
          {(user ? remotePublic : userPosts.filter((p) => p.target === 'public')).map(renderMyPost)}
          {!user && (<>
          <FeedCard
            variant="public"
            emoji="🌸"
            emojiBg="linear-gradient(135deg,#fbb040,#f97b9c)"
            name={t('publicLoc1')}
            meta={`${formatTimeAgo(32, lang)} · ${t('dayLabel')} 23`}
            tag={t('moodHard')}
            message={t('publicMsg1')}
            initialEmpathy={{ sent: 18, great: 12, me: 7 }}
          />
          <FeedCard
            variant="public"
            emoji="🌙"
            emojiBg="linear-gradient(135deg,#a78bfa,#f97b9c)"
            name={t('publicLoc2')}
            meta={`${formatTimeAgo(120, lang)} · ${t('dayLabel')} 41`}
            tag={t('moodDidIt')}
            message={t('publicMsg2')}
            initialEmpathy={{ sent: 31, great: 24, me: 15 }}
          />
          </>)}
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
