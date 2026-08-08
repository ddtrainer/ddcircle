import { useApp } from '../context/AppContext';
import { useLang } from '../i18n/LangContext';
import { graceDaysFor } from '../lib/ddLevel';
import { BREATH_MODES, BREATH_MODE_MULTIPLIER } from '../data/breathPatterns';
import { DASH_MODES, DASH_MODE_MULTIPLIER } from '../data/dashModes';
import styles from './DdLevelCard.module.css';

// 두 'YYYY-MM-DD' 날짜 사이의 달력 일수 차 (AppContext의 daysBetween과 동일 규칙).
function daysBetween(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

// 홈 화면 성장 카드 — v2.3: Deep/Dash 모두 레벨 폐지, 자유선택제.
// 실력 = 누적 스트릭/EP(상단), 종목 = 오늘의 선택(트랙별 종목·EP 배율 안내).
// 가이드 진입은 세션(DeepSession/SprintDetect) 내에서만 노출해 중복을 피한다.
export default function DdLevelCard() {
  const { userEp } = useApp();
  const { t } = useLang();
  const streak = userEp?.streak ?? 0;
  const streakDate = userEp?.streakDate ?? null;

  // 유예일(grace) 안내 — 사용자가 "며칠까지 쉬어도 연속이 유지되는지" 알 수 있게 표시.
  const grace = graceDaysFor(streak);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  let graceState = 'idle';   // idle | safeToday | atRisk | broken
  let graceLabel = '';
  if (streak === 0) {
    graceLabel = t('ddGraceStartToday');
  } else if (streakDate === todayStr) {
    graceState = 'safeToday';
    graceLabel = t('ddGraceSafeToday').replace('{grace}', grace);
  } else if (streakDate) {
    const missed = daysBetween(streakDate, todayStr) - 1; // 지금까지 실제로 거른 날 수
    const leftover = grace - missed;                       // 앞으로 더 쉴 수 있는 날
    if (leftover < 0) {
      graceState = 'broken';
      graceLabel = t('ddGraceBroken');
    } else if (missed >= 1) {
      // 하루 이상 실제로 걸렀을 때만 경고(주황) — 어제 완주(missed 0)는 정상으로 본다.
      graceState = 'atRisk';
      graceLabel = leftover === 0
        ? t('ddGraceAtRiskZero')
        : t('ddGraceAtRiskLeftover').replace('{leftover}', leftover).replace('{grace}', grace);
    } else {
      graceLabel = t('ddGraceSafe').replace('{grace}', grace);
    }
  } else {
    graceLabel = t('ddGraceSafe').replace('{grace}', grace);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>{t('ddCardTag')}</span>
        <p className={styles.intro}>{t('ddCardIntro')}</p>
        <div className={`${styles.streakRow} ${styles[`grace_${graceState}`] || ''}`}>
          <span className={styles.streakFlame}>🔥 {t('ddStreakFlame').replace('{n}', streak)}</span>
          <span className={styles.graceHint}>{graceLabel}</span>
        </div>
      </div>

      {/* Deep — 레벨 폐지, 호흡 종목 선택제. 종목별 EP 배율 안내(읽기 전용). */}
      <div className={styles.track} style={{ '--tc': 'var(--cool)', '--tc-soft': 'var(--cool-soft)' }}>
        <div className={styles.trackHead}>
          <div className={styles.trackTitle}>
            <span className={styles.trackLabel}>Deep</span>
          </div>
          <span className={styles.trackNow}>{t('ddPickBreathMult')}</span>
        </div>
        <div className={styles.steps}>
          {BREATH_MODES.map((m) => (
            <div key={m.id} className={styles.stepWrap}>
              <div className={`${styles.step} ${styles.unlocked}`}>
                <span className={styles.stepEmoji}>{m.emoji}</span>
                <span className={styles.stepName}>{t(m.shortLabelKey || m.labelKey)}</span>
                <span className={styles.stepMul}>×{BREATH_MODE_MULTIPLIER[m.id]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dash — 레벨 폐지, 종목 선택제. 종목별 EP 배율 안내(읽기 전용). */}
      <div className={styles.track} style={{ '--tc': 'var(--warm)', '--tc-soft': 'var(--warm-soft)' }}>
        <div className={styles.trackHead}>
          <div className={styles.trackTitle}>
            <span className={styles.trackLabel}>Dash</span>
          </div>
          <span className={styles.trackNow}>{t('ddPickModeMult')}</span>
        </div>
        <div className={styles.steps}>
          {DASH_MODES.map((m) => (
            <div key={m.key} className={styles.stepWrap}>
              <div className={`${styles.step} ${styles.unlocked}`}>
                <span className={styles.stepEmoji}>{m.emoji}</span>
                <span className={styles.stepName}>{t(m.labelKey)}</span>
                <span className={styles.stepMul}>×{DASH_MODE_MULTIPLIER[m.key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
