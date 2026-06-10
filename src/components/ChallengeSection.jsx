import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import { CHALLENGES } from '../data/challenges';
import { track, Events } from '../utils/analytics';
import styles from '../views/Home.module.css';

// 도전 이벤트 섹션 — 연속 출석 챌린지 참여/진행/보상.
// (기존 Home 인라인 블록을 그대로 추출 — 스타일은 Home.module.css 재사용)
export default function ChallengeSection() {
  const { t } = useLang();
  const { userEp, challengeClaims, challengeJoins, joinChallenge, leaveChallenge } = useApp();
  const { show: showToast } = useToast();

  return (
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
  );
}
