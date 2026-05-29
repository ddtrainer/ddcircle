import { useLevel } from '../context/LevelContext';
import { useApp } from '../context/AppContext';
import { DEEP_LEVELS, DASH_LEVELS, getLevelDef, checkLevelUp, MAX_LEVEL } from '../lib/ddLevel';
import styles from './DdLevelCard.module.css';

// 홈 화면 DD 레벨 대시보드 — Deep/Dash 전체 레벨 로드맵과 현재 위치, 다음 레벨 진행률을 표시한다 (읽기 전용).
// 가이드 진입은 세션(DeepSession/DashSession) 내에서만 노출해 중복을 피한다.
export default function DdLevelCard() {
  const { deepLevel, dashLevel } = useLevel();
  const { userEp } = useApp();
  const streak = userEp?.streak ?? 0;
  const totalEp = userEp?.total ?? 0;

  const tracks = [
    { key: 'deep', label: 'Deep · 심호흡', levels: DEEP_LEVELS, current: deepLevel },
    { key: 'dash', label: 'Dash · 운동', levels: DASH_LEVELS, current: dashLevel },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>DD 레벨</span>
      </div>

      {tracks.map(({ key, label, levels, current }) => {
        const def = getLevelDef(key, current);
        const { canLevelUp, next } = checkLevelUp(key, current, { streak, totalEp });
        const isMax = current >= MAX_LEVEL;

        return (
          <div key={key} className={styles.track}>
            <div className={styles.trackHead}>
              <span className={styles.trackLabel}>{label}</span>
              <span className={styles.trackNow}>
                Lv.{current} {def.name} · {def.method}
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
                    {i > 0 && <span className={styles.connector} />}
                    <div className={`${styles.step} ${styles[state]}`}>
                      <span className={styles.stepEmoji}>
                        {state === 'locked' ? '🔒' : lv.emoji}
                      </span>
                      <span className={styles.stepLv}>L{lv.level}</span>
                      <span className={styles.stepMul}>×{lv.multiplier}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isMax ? (
              <div className={styles.maxText}>최고 레벨 달성 🎉</div>
            ) : (
              <div className={styles.progress}>
                <span className={styles.progressLabel}>
                  다음 {next.emoji} {next.name}까지
                </span>
                <span className={styles.progressMeta}>
                  <span className={streak >= next.unlock.streak ? styles.met : ''}>
                    연속 {Math.min(streak, next.unlock.streak)}/{next.unlock.streak}일
                  </span>
                  {' · '}
                  <span className={totalEp >= next.unlock.ep ? styles.met : ''}>
                    EP {Math.min(totalEp, next.unlock.ep)}/{next.unlock.ep}
                  </span>
                </span>
                {canLevelUp && <span className={styles.readyBadge}>레벨업 가능!</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
