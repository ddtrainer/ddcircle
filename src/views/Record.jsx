import { useState, useEffect } from 'react';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TREE_LEVELS, getCurrentLevel, getNextLevel, LAST_14_DAYS } from '../data/treeLevels';
import { getMultiplier } from '../utils/ep';
import { fetchMyPosts } from '../lib/posts';
import { fetchUserStats, fetchLastNDaysEp, fetchTodayBreakdown, fetchMonthActivity } from '../lib/stats';
import TreeSVG from '../components/TreeSVG';
import EPModal from '../components/modals/EPModal';
import styles from './Record.module.css';

// EP 라인 (오늘의 EP 내역)
const TODAY_EP_BREAKDOWN = {
  dash: 10,
  deep: 15,
  fullSet: 5,
  proof: 5,
  share: 5,
  empathySent: 4,
  empathyReceived: 6,
};
const SENT_COUNT = 4;
const RECV_COUNT = 12;

// 활동 분석 (이번 달)
const ACTIVITY = [
  { icon: '🔥', labelKey: 'dashLabel', value: 130, max: 140, color: 'dash' },
  { icon: '🧘', labelKey: 'deepLabel', value: 195, max: 210, color: 'deep' },
  { icon: '📸', labelKey: 'proofShareLabel', value: 110, max: 140, color: 'share' },
  { icon: '🤝', labelKey: 'empathyLabel', value: 128, max: 200, color: 'empathy' },
  { icon: '👋', labelKey: 'friendLabel', value: 42, max: 120, color: 'friend' },
];

export default function Record() {
  const { t } = useLang();
  const { userEp } = useApp();
  const { user } = useAuth();
  const [epModalOpen, setEpModalOpen] = useState(false);
  const [proofPosts, setProofPosts] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [remoteStats, setRemoteStats] = useState(null);   // user_stats row
  const [remoteChart, setRemoteChart] = useState(null);   // [{date, earnedEp}, ...]
  const [todayActivity, setTodayActivity] = useState(null); // 오늘 활동
  const [monthActivity, setMonthActivity] = useState(null); // 이번 달 활동

  useEffect(() => {
    if (!user) {
      setProofPosts([]);
      setRemoteStats(null);
      setRemoteChart(null);
      setTodayActivity(null);
      setMonthActivity(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [posts, stats, chart, today, month] = await Promise.all([
        fetchMyPosts(user.id, 100),
        fetchUserStats(user.id),
        fetchLastNDaysEp(user.id, 14),
        fetchTodayBreakdown(user.id),
        fetchMonthActivity(user.id),
      ]);
      if (cancelled) return;
      setProofPosts(posts.filter((p) => p.has_proof && p.proof_url));
      setRemoteStats(stats);
      setRemoteChart(chart);
      setTodayActivity(today);
      setMonthActivity(month);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // 인증 시 user_stats 우선, 아니면 localStorage userEp
  const useRemote = !!(user && remoteStats);
  const displayStats = useRemote
    ? {
        total: remoteStats.total_ep,
        today: remoteStats.today_ep,
        thisMonth: remoteStats.month_ep,
        streak: remoteStats.streak,
        empathySent: remoteStats.empathy_sent,
        empathyReceived: remoteStats.empathy_received,
      }
    : userEp;

  const ep = displayStats.total;
  const cur = getCurrentLevel(ep);
  const next = getNextLevel(ep);
  const epToNext = Math.max(0, next.min - ep);
  const progressPct = Math.min(((ep - cur.min) / (cur.max - cur.min)) * 100, 100);

  const multiplier = getMultiplier(displayStats.streak);
  const multiplierText =
    multiplier > 1 ? t('multiplierActive', { x: multiplier }) : t('noMultiplier');

  const today = new Date();
  const dayOfMonth = today.getDate();
  const monthlyAvg = Math.round(displayStats.thisMonth / Math.max(dayOfMonth, 1));

  // 오늘 활동 기반 EP 내역 (인증 시 실데이터, 아니면 데모)
  const tb = useRemote && todayActivity
    ? {
        dash: todayActivity.sessionDone ? 10 : 0,
        deep: todayActivity.sessionDone ? 15 : 0,
        fullSet: todayActivity.sessionDone ? 5 : 0,
        proof: todayActivity.hasProof ? 5 : 0,
        share: todayActivity.shared ? 5 : 0,
        empathySent: Math.min(todayActivity.sentCount, 10) * 0.4, // +0.4/회, 최대 10회 = 4 EP
        empathyReceived: Math.min(todayActivity.receivedCount, 20) * 0.3, // +0.3/회, 최대 20회 = 6 EP
      }
    : TODAY_EP_BREAKDOWN;
  const sentCount = useRemote && todayActivity ? todayActivity.sentCount : SENT_COUNT;
  const recvCount = useRemote && todayActivity ? todayActivity.receivedCount : RECV_COUNT;
  const baseTotal = tb.dash + tb.deep + tb.fullSet + tb.proof + tb.share + tb.empathySent + tb.empathyReceived;
  const finalEp = Math.round(baseTotal * multiplier);

  // 인증 시 실데이터 차트, 아니면 데모
  const chartData = useRemote && remoteChart
    ? remoteChart.map((r) => r.earnedEp)
    : LAST_14_DAYS;
  const maxChart = Math.max(...chartData, 1);
  const chartLabels = chartData.map((_, i) => {
    const off = chartData.length - 1 - i;
    const d = new Date(today);
    d.setDate(today.getDate() - off);
    return { day: d.getDate(), isToday: i === chartData.length - 1 };
  });

  return (
    <div className={styles.record}>
      {/* 생명나무 카드 */}
      <div className={styles.treeCard}>
        <div className={styles.treeBadge}>LEVEL {cur.id}</div>
        <div className={styles.treeVisual}>
          <TreeSVG level={cur.id} />
        </div>
        <div className={styles.treeName}>{t(cur.key)}</div>
        <div className={styles.treeEp}>
          <span className={styles.epNum}>{ep.toLocaleString()}</span>
          {t('epAccumulated')}
        </div>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progressPct}%` }} />
        </div>
        <div className={styles.progressLabel}>
          {t('nextLevelLabel')} <span className={styles.nextLevel}>{t(next.key)}</span>{' '}
          {t('untilNext')}{' '}
          <span className={styles.nextLevel}>{epToNext.toLocaleString()} EP</span>
        </div>
      </div>

      {/* DDT 안내 */}
      <div className={styles.ddtNotice}>
        <div className={styles.ddtIcon}>💎</div>
        <div
          className={styles.ddtText}
          dangerouslySetInnerHTML={{ __html: t('ddtNoticeText') }}
        />
        <div className={styles.ddtLink} onClick={() => setEpModalOpen(true)}>
          {t('learnMore')}
        </div>
      </div>

      {/* 통계 4종 */}
      <div className={styles.statsGrid}>
        <Stat
          label={t('streakLabel')}
          value={`🔥 ${displayStats.streak}${t('daysShort')}`}
          color="warm"
          sub={multiplierText}
        />
        <Stat
          label={t('todayEp')}
          value={`+${displayStats.today}`}
          color="gold"
          sub={t('dashDeepFull')}
        />
        <Stat
          label={t('thisMonth')}
          value={`${displayStats.thisMonth} EP`}
          color="cool"
          sub={t('monthlyAvgTpl', { avg: monthlyAvg })}
        />
        <Stat
          label={t('empathyShared')}
          value={`💌 ${displayStats.empathySent}`}
          color="calm"
          sub={t('empathyReceivedTpl', { n: displayStats.empathyReceived })}
        />
      </div>

      {/* 오늘의 EP 내역 */}
      <div className={styles.todayEpCard}>
        <div className={styles.todayEpHeader}>
          <div className={styles.todayEpTitle}>{t('todayEpDetail')}</div>
          <div className={styles.todayEpTotal}>
            +{finalEp}<span className={styles.unit}>EP</span>
          </div>
        </div>
        <EpLine icon="🔥" name={t('dashCompleteRow')} sub={`(${t('seconds60')})`} value={tb.dash} />
        <EpLine icon="🧘" name={t('deepCompleteRow')} sub={`(${t('cycles6')})`} value={tb.deep} />
        <EpLine icon="✦" name={t('fullSetBonus')} value={tb.fullSet} bonus />
        <EpLine icon="📸" name={t('proofCapture')} value={tb.proof} />
        <EpLine icon="💙" name={t('shareEp')} value={tb.share} />
        <EpLine
          icon="🤝"
          name={t('empathyGivenRow')}
          sub={`(${sentCount}${t('timesUnit')})`}
          value={tb.empathySent}
        />
        <EpLine
          icon="❤️"
          name={t('empathyGottenRow')}
          sub={`(${recvCount}${t('timesUnit')})`}
          value={tb.empathyReceived}
        />
        <div className={styles.multiplierRow}>
          {t('baseScoreTpl', { base: baseTotal })} ×{' '}
          <span className={styles.mult}>
            {multiplier} ({t('streakDaysTpl', { days: displayStats.streak })})
          </span>{' '}
          ={' '}
          <strong style={{ color: 'var(--warm)', fontSize: 14 }}>
            {finalEp} EP
          </strong>
        </div>
      </div>

      {/* 14일 차트 */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>{t('weeklyChart')}</div>
        <div className={styles.chartBars}>
          {chartData.map((dayEp, i) => {
            const isToday = i === chartData.length - 1;
            const height = dayEp === 0 ? 4 : (dayEp / maxChart) * 100;
            return (
              <div key={i} className={styles.chartCol} title={`${dayEp} EP`}>
                <div
                  className={`${styles.chartBar} ${dayEp === 0 ? styles.zero : ''} ${isToday ? styles.today : ''}`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className={styles.chartLabels}>
          {chartLabels.map((c, i) => {
            const showDate = i % 2 === 0 || c.isToday;
            return (
              <div
                key={i}
                className={`${styles.chartLabel} ${c.isToday ? styles.todayLabel : ''}`}
              >
                {showDate ? c.day : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* 이번 달 활동 분석 */}
      <div className={styles.breakdownCard}>
        <div className={styles.chartTitle}>{t('activityBreakdown')}</div>
        {(useRemote && monthActivity
          ? [
              { icon: '🔥', labelKey: 'dashLabel', value: monthActivity.dashCount * 10, max: 140, color: 'dash', unit: '회', rawCount: monthActivity.dashCount },
              { icon: '🧘', labelKey: 'deepLabel', value: monthActivity.deepCount * 15, max: 210, color: 'deep', unit: '회', rawCount: monthActivity.deepCount },
              { icon: '📸', labelKey: 'proofShareLabel', value: monthActivity.proofCount * 10, max: 140, color: 'share', unit: '회', rawCount: monthActivity.proofCount },
              { icon: '🤝', labelKey: 'empathyLabel', value: Math.round(monthActivity.empathyCount * 0.4), max: 200, color: 'empathy', unit: '회', rawCount: monthActivity.empathyCount },
              { icon: '👋', labelKey: 'friendLabel', value: monthActivity.nudgeCount * 2, max: 120, color: 'friend', unit: '회', rawCount: monthActivity.nudgeCount },
            ]
          : ACTIVITY
        ).map((a) => {
          const pct = Math.min((a.value / a.max) * 100, 100);
          return (
            <div key={a.labelKey} className={styles.breakdownRow}>
              <div className={styles.breakdownLabel}>
                {a.icon} {t(a.labelKey)}
              </div>
              <div className={styles.breakdownBarWrap}>
                <div
                  className={`${styles.breakdownBar} ${styles[a.color]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className={styles.breakdownValue}>{a.value} EP</div>
            </div>
          );
        })}
        <div
          className={styles.breakdownRow}
          style={{ borderTop: '1px dashed var(--border-strong)', marginTop: 6, paddingTop: 12 }}
        >
          <div className={styles.breakdownLabel} style={{ fontWeight: 600 }}>
            {t('multiplierBonus')}
          </div>
          <div className={styles.breakdownBarWrap}>
            <div
              className={styles.breakdownBar}
              style={{ width: '28%', background: 'var(--gold)' }}
            />
          </div>
          <div className={styles.breakdownValue} style={{ color: 'var(--gold)' }}>
            +27 EP
          </div>
        </div>
      </div>

      {/* 셀카 갤러리 */}
      <div className={styles.galleryCard}>
        <div className={styles.chartTitle}>{t('galleryTitle')}</div>
        {proofPosts.length === 0 ? (
          <div className={styles.galleryEmpty}>
            {user ? t('galleryEmpty') : t('galleryLoginPrompt')}
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {proofPosts.map((p) => {
              const d = new Date(p.created_at);
              const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={styles.galleryCell}
                  onClick={() => setLightbox(p)}
                >
                  <img src={p.proof_url} alt={dateLabel} loading="lazy" />
                  <span className={styles.galleryDate}>{dateLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.lightboxClose}
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >×</button>
            <img src={lightbox.proof_url} alt="" />
            <div className={styles.lightboxMeta}>
              {new Date(lightbox.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
              {lightbox.message ? ` · ${lightbox.message}` : ''}
            </div>
          </div>
        </div>
      )}

      {/* EP 시스템 안내 모달 */}
      <EPModal open={epModalOpen} onClose={() => setEpModalOpen(false)} />
    </div>
  );
}

function Stat({ label, value, color, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statValue} ${styles[color]}`}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}

function EpLine({ icon, name, sub, value, bonus }) {
  return (
    <div className={`${styles.epLine} ${bonus ? styles.bonus : ''}`}>
      <div className={styles.epLineLeft}>
        <span className={styles.epLineIcon}>{icon}</span>
        <span className={styles.epLineName}>
          {name}
          {sub && <span className={styles.subText}> {sub}</span>}
        </span>
      </div>
      <div className={styles.epLineValue}>+{value}</div>
    </div>
  );
}
