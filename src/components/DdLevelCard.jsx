import { useLevel } from '../context/LevelContext';
import { useApp } from '../context/AppContext';
import { DEEP_LEVELS, DASH_LEVELS, getLevelDef, checkLevelUp, MAX_LEVEL, graceDaysFor } from '../lib/ddLevel';
import styles from './DdLevelCard.module.css';

// 두 'YYYY-MM-DD' 날짜 사이의 달력 일수 차 (AppContext의 daysBetween과 동일 규칙).
function daysBetween(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

// 홈 화면 DD 레벨 대시보드 — Deep/Dash 전체 레벨 로드맵과 현재 위치, 다음 레벨 진행률을 표시한다 (읽기 전용).
// 처음 보는 사용자도 한눈에 이해하도록: 한 줄 설명 + 트랙별 색상(Deep=파랑/Dash=주황) + '지금' 위치 + 진행 막대.
// 가이드 진입은 세션(DeepSession/DashSession) 내에서만 노출해 중복을 피한다.
export default function DdLevelCard() {
  const { deepLevel, dashLevel } = useLevel();
  const { userEp } = useApp();
  const streak = userEp?.streak ?? 0;
  const totalEp = userEp?.total ?? 0;
  const streakDate = userEp?.streakDate ?? null;

  // 유예일(grace) 안내 — 사용자가 "며칠까지 쉬어도 연속이 유지되는지" 알 수 있게 표시.
  const grace = graceDaysFor(streak);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  let graceState = 'idle';   // idle | safeToday | atRisk | broken
  let graceLabel = '';
  if (streak === 0) {
    graceLabel = '오늘 시작하면 연속 1일';
  } else if (streakDate === todayStr) {
    graceState = 'safeToday';
    graceLabel = `오늘 완료 · ${grace}일까지 쉬어도 유지`;
  } else if (streakDate) {
    const missed = daysBetween(streakDate, todayStr) - 1; // 지금까지 실제로 거른 날 수
    const leftover = grace - missed;                       // 앞으로 더 쉴 수 있는 날
    if (leftover < 0) {
      graceState = 'broken';
      graceLabel = '연속이 끊겼어요 · 오늘 하면 1일부터 다시';
    } else if (missed >= 1) {
      // 하루 이상 실제로 걸렀을 때만 경고(주황) — 어제 완주(missed 0)는 정상으로 본다.
      graceState = 'atRisk';
      graceLabel = leftover === 0
        ? '오늘 안 하면 연속이 끊겨요'
        : `오늘 쉬어도 ${leftover}일 여유 · ${grace}일까지 유지`;
    } else {
      graceLabel = `${grace}일까지 쉬어도 연속 유지`;
    }
  } else {
    graceLabel = `${grace}일까지 쉬어도 연속 유지`;
  }

  const tracks = [
    { key: 'deep', label: 'Deep', sub: '호흡', color: 'var(--cool)', soft: 'var(--cool-soft)', levels: DEEP_LEVELS, current: deepLevel },
    { key: 'dash', label: 'Dash', sub: '운동', color: 'var(--warm)', soft: 'var(--warm-soft)', levels: DASH_LEVELS, current: dashLevel },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>나의 성장 단계</span>
        <p className={styles.intro}>매일 호흡과 운동이 쌓여 한 단계씩 자라요.</p>
        <div className={`${styles.streakRow} ${styles[`grace_${graceState}`] || ''}`}>
          <span className={styles.streakFlame}>🔥 {streak}일 연속</span>
          <span className={styles.graceHint}>{graceLabel}</span>
        </div>
      </div>

      {tracks.map(({ key, label, sub, color, soft, levels, current }) => {
        const def = getLevelDef(key, current);
        const { canLevelUp, next } = checkLevelUp(key, current, { streak, totalEp });
        const isMax = current >= MAX_LEVEL;

        // 다음 레벨까지 진행률 — 연속일·EP 두 조건의 평균(0~100%).
        let pct = 100;
        if (!isMax && next) {
          const sPct = next.unlock.streak ? Math.min(streak / next.unlock.streak, 1) : 1;
          const ePct = next.unlock.ep ? Math.min(totalEp / next.unlock.ep, 1) : 1;
          pct = Math.round(((sPct + ePct) / 2) * 100);
        }

        return (
          <div key={key} className={styles.track} style={{ '--tc': color, '--tc-soft': soft }}>
            <div className={styles.trackHead}>
              <div className={styles.trackTitle}>
                <span className={styles.trackLabel}>{label}</span>
                <span className={styles.trackSub}>{sub}</span>
              </div>
              <span className={styles.trackNow}>
                지금 <b>Lv.{current} {def.name}</b> · {def.method}
              </span>
            </div>

            <div className={styles.steps}>
              {levels.map((lv, i) => {
                const state =
                  lv.level === current ? 'current'
                  : lv.level < current ? 'done'
                  : (streak >= lv.unlock.streak && totalEp >= lv.unlock.ep) ? 'unlocked'
                  : 'locked';
                return (
                  <div key={lv.level} className={styles.stepWrap}>
                    {i > 0 && (
                      <span className={`${styles.connector} ${lv.level <= current ? styles.connectorDone : ''}`} />
                    )}
                    <div className={`${styles.step} ${styles[state]}`}>
                      {state === 'current' && <span className={styles.nowPill}>지금</span>}
                      <span className={styles.stepEmoji}>
                        {state === 'locked' ? '🔒' : lv.emoji}
                      </span>
                      <span className={styles.stepName}>{lv.name}</span>
                      <span className={styles.stepMul}>EP ×{lv.multiplier}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isMax ? (
              <div className={styles.maxText}>🎉 최고 단계 달성! EP ×{def.multiplier} 보너스 적용 중</div>
            ) : (
              <div className={styles.progress}>
                <div className={styles.progressTop}>
                  <span className={styles.progressLabel}>
                    다음 {next.emoji} {next.name} (Lv.{next.level})까지
                  </span>
                  {canLevelUp && <span className={styles.readyBadge}>레벨업 가능!</span>}
                </div>
                <div className={styles.bar}>
                  <span className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.reqs}>
                  <span className={`${styles.req} ${streak >= next.unlock.streak ? styles.met : ''}`}>
                    {streak >= next.unlock.streak ? '✓ ' : ''}연속 {Math.min(streak, next.unlock.streak)}/{next.unlock.streak}일
                  </span>
                  <span className={`${styles.req} ${totalEp >= next.unlock.ep ? styles.met : ''}`}>
                    {totalEp >= next.unlock.ep ? '✓ ' : ''}EP {Math.min(totalEp, next.unlock.ep)}/{next.unlock.ep}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
