import { useState, useRef, useEffect } from 'react';
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

  // 로그인 상태면 Supabase에서 피드 + 친구 목록 가져오기
  useEffect(() => {
    if (!user) {
      setRemoteCircle([]);
      setRemotePublic([]);
      setRemoteFriends([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [circle, pub, friendsList] = await Promise.all([
        fetchCircleFeed(50),
        fetchPublicFeed(50),
        fetchFriends(user.id),
      ]);
      if (cancelled) return;
      setRemoteCircle(circle.map(normalizePost));
      setRemotePublic(pub.map(normalizePost));
      setRemoteFriends(friendsList);
    })();
    return () => { cancelled = true; };
  }, [user]);
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

  const handleEncSelect = (encId) => {
    if (!encFriend) return;
    sendEncouragement(encFriend.id, encId);
    const enc = findEncouragement(encId);
    showToast(enc?.emoji || '💌', `${t('encToastSent')} · ${t(enc?.textKey)}`);
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

  const sendNudge = (friend) => {
    if (nudged[friend.id]) return;
    setNudged((prev) => ({ ...prev, [friend.id]: true }));
    const name = lang === 'ko' ? friend.name : friend.enName;
    showToast('💌', name + t('nudgeSent'));
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

      {/* 내 서클 탭 */}
      {tab === 'circle' && (
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
                <div className={styles.summaryNum}>{FRIENDS.length}</div>
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
      {tab === 'public' && (
        <div>
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
