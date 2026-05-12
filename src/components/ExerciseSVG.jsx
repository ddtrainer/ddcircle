import styles from './ExerciseSVG.module.css';

// 6가지 운동의 SVG 스틱피규어 + 자체 애니메이션
// type: 'jumping-jack' | 'jog' | 'squat' | 'burpee' | 'running' | 'free'
export default function ExerciseSVG({ type = 'jumping-jack', size = 130 }) {
  const props = { viewBox: '0 0 100 100', width: size, height: size };

  if (type === 'jumping-jack') {
    return (
      <svg className={styles.jj} {...props}>
        <circle className={styles.head} cx="50" cy="22" r="7" fill="#f47730" />
        <g className={styles.body}>
          <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" />
        </g>
        <line className={styles.armL} x1="50" y1="35" x2="36" y2="48" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.armR} x1="50" y1="35" x2="64" y2="48" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.legL} x1="50" y1="55" x2="42" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.legR} x1="50" y1="55" x2="58" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'jog') {
    return (
      <svg className={styles.jog} {...props}>
        <circle className={styles.head} cx="50" cy="22" r="7" fill="#f47730" />
        <g className={styles.body}>
          <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" />
        </g>
        <line className={styles.jogArmL} x1="50" y1="38" x2="40" y2="52" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.jogArmR} x1="50" y1="38" x2="60" y2="52" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.jogLegL} x1="50" y1="55" x2="46" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.jogLegR} x1="50" y1="55" x2="54" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'squat') {
    return (
      <svg className={styles.squat} {...props}>
        <circle className={styles.sqHead} cx="50" cy="22" r="7" fill="#f47730" />
        <g className={styles.sqBody}>
          <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" />
        </g>
        <line className={styles.sqArm} x1="50" y1="38" x2="38" y2="48" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.sqArm} x1="50" y1="38" x2="62" y2="48" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <g className={styles.sqLeg}>
          <line x1="50" y1="55" x2="42" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="55" x2="58" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (type === 'running') {
    return (
      <svg className={styles.running} {...props}>
        <g className={styles.runFigure}>
          <circle className={styles.head} cx="50" cy="22" r="7" fill="#f47730" />
          <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" transform="rotate(-12 50 41)" />
          <line className={styles.runArmL} x1="50" y1="38" x2="36" y2="44" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line className={styles.runArmR} x1="50" y1="38" x2="64" y2="50" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line className={styles.runLegL} x1="50" y1="55" x2="38" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line className={styles.runLegR} x1="50" y1="55" x2="62" y2="76" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (type === 'free') {
    return (
      <svg className={styles.free} {...props}>
        <circle className={styles.freeHead} cx="50" cy="22" r="7" fill="#f47730" />
        <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" />
        <line className={styles.freeArmL} x1="50" y1="35" x2="34" y2="20" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.freeArmR} x1="50" y1="35" x2="66" y2="20" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="55" x2="44" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="55" x2="56" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'burpee') {
    return (
      <svg className={styles.burpee} {...props}>
        <g className={styles.brFigure}>
          <circle cx="50" cy="22" r="7" fill="#f47730" />
          <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" />
          <line x1="50" y1="38" x2="40" y2="50" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="38" x2="60" y2="50" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="55" x2="44" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="55" x2="56" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  return null;
}
