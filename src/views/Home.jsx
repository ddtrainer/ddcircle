import { useState, useEffect } from 'react';
import { fetchMemberCount } from '../lib/stats';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useNextSetTiming } from '../hooks/useNextSetTiming';
import SetTimingModal from '../components/modals/SetTimingModal';
import LoginPromptModal from '../components/modals/LoginPromptModal';
import YesterdayPageCard from '../components/assets/YesterdayPageCard';
import { CHALLENGES } from '../data/challenges';
import { track, Events } from '../utils/analytics';
import { unlockAudio } from '../utils/audioUnlock';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useLang();
  const { setTiming, todayDone, todayCount, userEp, challengeClaims, challengeJoins, joinChallenge, leaveChallenge } = useApp();
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const next = useNextSetTiming(setTiming, todayDone);
  const [setTimingOpen, setSetTimingOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState({ open: false, reason: 'second', data: null });

  // 소프트 게이트: 비로그인 사용자에게 의미 있는 순간에 로그인 유도.
  // 일일 1회 빈도 제한 (localStorage에 dismiss 날짜 저장)
  useEffect(() => {
    if (user) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem('ddcircle.loginPromptShown');
    if (lastShown === todayKey) return;

    // 우선순위: streak 3+ > 2회차 세션
    if (userEp.streak >= 3) {
      const tid = setTimeout(() => {
        setLoginPrompt({ open: true, reason: 'streak', data: { n: userEp.streak } });
        localStorage.setItem('ddcircle.loginPromptShown', todayKey);
      }, 1500);
      return () => clearTimeout(tid);
    } else if (todayCount >= 1) {
      const tid = setTimeout(() => {
        setLoginPrompt({ open: true, reason: 'second', data: null });
        localStorage.setItem('ddcircle.loginPromptShown', todayKey);
      }, 1500);
      return () => clearTimeout(tid);
    }
  }, [user, userEp.streak, todayCount]);

  // DDCircle 회원수 — 닉네임 설정한 프로필 수. mount 시 1회 fetch.
  // 가짜 247 대신 진짜 숫자 표시.
  const [memberCount, setMemberCount] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchMemberCount().then((n) => { if (!cancelled) setMemberCount(n); });
    return () => { cancelled = true; };
  }, []);

  // 진입 탭 시점에 오디오 unlock — iOS Safari가 이후 자동 재생되는 종소리/배경음을
  // 묵음으로 거부하지 않도록 silent buffer를 사용자 제스처 안에서 한 번 재생.
  const goPicker = () => { unlockAudio(); navigate('/picker'); };
  const goWall = () => navigate('/wall');

  // 셋 타이밍 카드 클릭: live면 picker로, 아니면 모달
  const handleSetCardClick = () => {
    if (next.mode === 'live') goPicker();
    else setSetTimingOpen(true);
  };

  // 셋 카드 CTA 버튼: live면 시작, 아니면 모달
  const handleSetCta = (e) => {
    e.stopPropagation();
    if (next.mode === 'live') goPicker();
    else setSetTimingOpen(true);
  };

  return (
    <div className={styles.home}>
      {/* 셋 타이밍 카드 */}
      <div
        className={`${styles.setTimingCard} ${next.mode === 'live' ? styles.active : ''}`}
        onClick={handleSetCardClick}
      >
        <div className={styles.setInfo}>
          <div className={styles.setLabel}>
            {next.mode === 'live' && <span className={styles.liveDot}></span>}
            {next.label}
          </div>
          <div className={styles.setTime}>
            {next.mode === 'off' && next.timeText}
            {next.mode === 'live' && (
              <>
                {next.icon} {next.slotName} · <span className={styles.accent}>{next.accentText}</span>
              </>
            )}
            {next.mode === 'next' && (
              <>
                {next.icon} <span className={styles.accent}>{next.accentTime}</span> · {next.remainText}
              </>
            )}
          </div>
        </div>
        <button
          className={`${styles.setCta} ${next.mode === 'live' ? '' : styles.dim}`}
          onClick={handleSetCta}
        >
          {next.ctaLabel}
        </button>
      </div>

      {/* 히어로 */}
      <div className={styles.hero}>
        <p
          className={styles.heroQuote}
          dangerouslySetInnerHTML={{ __html: t('heroQuote') }}
        />
        <div className={styles.heroSub}>DEEP RELAXATION · DASH EXERCISE</div>
      </div>

      {/* 호흡 원 */}
      <div className={styles.breathZone} onClick={goPicker}>
        <div className={styles.breathCircle}>
          <div className={styles.breathRing}></div>
          <div className={`${styles.breathRing} ${styles.r2}`}></div>
          <div className={`${styles.breathRing} ${styles.r3}`}></div>
          <div className={styles.breathInner}>
            <div className={styles.label}>
              {userEp.streak > 0
                ? `🔥 ${t('streakDayBadge').replace('{n}', userEp.streak)}`
                : `🌱 ${t('firstStartBadge')}`}
            </div>
            <div className={styles.time}>{t('nowStart')}</div>
            <div className={styles.cta}>{t('tapToStart')}</div>
          </div>
        </div>
      </div>

      {/* DDCircle 회원수 — 닉네임 설정한 프로필 기준 */}
      <div className={styles.together}>
        <div className={styles.togetherNum}>
          <span className={styles.pulseDot}></span>
          <span>{memberCount === null ? '—' : memberCount.toLocaleString()}</span>
          <span>{t('peopleSuffix')}</span>
        </div>
        <div className={styles.togetherLabel}>{t('memberCountLabel')}</div>
      </div>

      {/* 도전 이벤트 섹션 */}
      <div className={styles.challengeSection}>
        <div className={styles.challengeHeader}>
          <div className={styles.challengeTitle}>{t('challengeSectionTitle')}</div>
          <div className={styles.challengeSub}>{t('challengeSectionSub')}</div>
        </div>
        <div className={styles.challengeRow}>
          {CHALLENGES.map((ch) => {
            const claimed = !!challengeClaims[ch.id];
            const join = challengeJoins[ch.id];
            const joined = !!join && !claimed;
            const progress = join ? Math.max(0, userEp.streak - join.startStreak) : 0;
            const cur = claimed ? ch.target : Math.min(progress, ch.target);
            const pct = Math.min(100, (cur / ch.target) * 100);

            const handleJoin = (e) => {
              e.stopPropagation();
              const stake = ch.stakeEp || 0;
              // 보증 EP 확인 다이얼로그
              if (stake > 0) {
                const msg = t('challengePledgeConfirm')
                  .replace('{title}', t(ch.titleKey))
                  .replace('{stake}', stake)
                  .replace('{bonus}', ch.bonusEp);
                if (!window.confirm(msg)) return;
              }
              const result = joinChallenge(ch.id);
              if (!result.ok) {
                if (result.reason === 'insufficient_ep') {
                  showToast('⚠️', t('challengeStakeShortage').replace('{n}', result.needed));
                }
                return;
              }
              track(Events.CHALLENGE_JOINED, { challengeId: ch.id, target: ch.target });
              showToast(ch.emoji, `${t('challengeJoinToast')} ${t(ch.titleKey)}`);
            };
            const handleLeave = (e) => {
              e.stopPropagation();
              const stake = join?.stakedEp || 0;
              if (stake > 0) {
                const msg = t('challengeLeaveConfirm').replace('{stake}', stake);
                if (!window.confirm(msg)) return;
              }
              leaveChallenge(ch.id);
              showToast('🏳️', t('challengeLeaveToast'));
            };

            return (
              <div
                key={ch.id}
                className={`${styles.challengeCard} ${claimed ? styles.claimed : ''} ${joined ? styles.joined : ''}`}
              >
                <div className={styles.challengeEmoji}>{ch.emoji}</div>
                <div className={styles.challengeName}>{t(ch.titleKey)}</div>
                <div className={styles.challengeDesc}>{t(ch.descKey)}</div>

                {(joined || claimed) && (
                  <div className={styles.challengeBar}>
                    <div className={styles.challengeBarFill} style={{ width: `${pct}%` }} />
                  </div>
                )}

                {claimed && (
                  <div className={styles.challengeMeta}>
                    <span className={styles.challengeDoneTxt}>
                      {t('challengeDone').replace('{ep}', ch.bonusEp)}
                    </span>
                  </div>
                )}

                {joined && (
                  <>
                    <div className={styles.challengeMeta}>
                      <span>{t('challengeProgress').replace('{cur}', cur).replace('{tar}', ch.target)}</span>
                      <span className={styles.challengeReward}>+{ch.bonusEp} EP</span>
                    </div>
                    {join?.stakedEp > 0 && (
                      <div className={styles.challengeStakeBadge}>
                        🔒 {t('challengeStakeActive').replace('{n}', join.stakedEp)}
                      </div>
                    )}
                    <button className={styles.challengeLeaveBtn} onClick={handleLeave}>
                      {t('challengeLeave')}
                    </button>
                  </>
                )}

                {!joined && !claimed && (
                  <>
                    <div className={styles.challengeReward}>+{ch.bonusEp} EP</div>
                    {ch.stakeEp > 0 && (
                      <div className={styles.challengeStakeHint}>
                        {t('challengeStakeHint').replace('{n}', ch.stakeEp)}
                      </div>
                    )}
                    <button className={styles.challengeJoinBtn} onClick={handleJoin}>
                      {ch.stakeEp > 0 ? t('challengePledge') : t('challengeJoin')}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 시작 버튼 */}
      <button className={styles.startBtn} onClick={goPicker}>{t('startBtn')}</button>

      {/* 어제(또는 최근)의 페이지 미니 카드 — 재방문 + 책장 발견 */}
      <YesterdayPageCard />

      {/* 철학 인용 */}
      <div className={styles.philosophy}>
        <p dangerouslySetInnerHTML={{ __html: t('philosophyText') }} />
      </div>

      {/* 셋 타이밍 모달 */}
      <SetTimingModal open={setTimingOpen} onClose={() => setSetTimingOpen(false)} />

      <LoginPromptModal
        open={loginPrompt.open}
        reason={loginPrompt.reason}
        data={loginPrompt.data}
        onClose={() => setLoginPrompt({ ...loginPrompt, open: false })}
      />
    </div>
  );
}
