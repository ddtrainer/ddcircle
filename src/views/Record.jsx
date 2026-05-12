import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { TREE_LEVELS, getCurrentLevel, getNextLevel, LAST_14_DAYS } from '../data/treeLevels';
import { getMultiplier } from '../utils/ep';
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
  const [epModalOpen, setEpModalOpen] = useState(false);

  const ep = userEp.total;
  const cur = getCurrentLevel(ep);
  const next = getNextLevel(ep);
  const epToNext = Math.max(0, next.min - ep);
  const progressPct = Math.min(((ep - cur.min) / (cur.max - cur.min)) * 100, 100);

  const multiplier = getMultiplier(userEp.streak);
  const multiplierText =
    multiplier > 1 ? t('multiplierActive', { x: multiplier }) : t('noMultiplier');

  const today = new Date();
  const dayOfMonth = today.getDate();
  const monthlyAvg = Math.round(userEp.thisMonth / Math.max(dayOfMonth, 1));

  const tb = TODAY_EP_BREAKDOWN;
  const baseTotal = tb.dash + tb.deep + tb.fullSet + tb.proof + tb.share + tb.empathySent + tb.empathyReceived;
  const finalEp = Math.round(baseTotal * multiplier);

  const maxChart = Math.max(...LAST_14_DAYS, 1);
  const chartLabels = LAST_14_DAYS.map((_, i) => {
    const off = LAST_14_DAYS.length - 1 - i;
    const d = new Date(today);
    d.setDate(today.getDate() - off);
    return { day: d.getDate(), isToday: i === LAST_14_DAYS.length - 1 };
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
          value={`🔥 ${userEp.streak}${t('daysShort')}`}
          color="warm"
          sub={multiplierText}
        />
        <Stat
          label={t('todayEp')}
          value={`+${userEp.today}`}
          color="gold"
          sub={t('dashDeepFull')}
        />
        <Stat
          label={t('thisMonth')}
          value={`${userEp.thisMonth} EP`}
          color="cool"
          sub={t('monthlyAvgTpl', { avg: monthlyAvg })}
        />
        <Stat
          label={t('empathyShared')}
          value={`💌 ${userEp.empathySent}`}
          color="calm"
          sub={t('empathyReceivedTpl', { n: userEp.empathyReceived })}
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
          sub={`(${SENT_COUNT}${t('timesUnit')})`}
          value={tb.empathySent}
        />
        <EpLine
          icon="❤️"
          name={t('empathyGottenRow')}
          sub={`(${RECV_COUNT}${t('timesUnit')})`}
          value={tb.empathyReceived}
        />
        <div className={styles.multiplierRow}>
          {t('baseScoreTpl', { base: baseTotal })} ×{' '}
          <span className={styles.mult}>
            {multiplier} ({t('streakDaysTpl', { days: userEp.streak })})
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
          {LAST_14_DAYS.map((dayEp, i) => {
            const isToday = i === LAST_14_DAYS.length - 1;
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
        {ACTIVITY.map((a) => {
          const pct = (a.value / a.max) * 100;
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
