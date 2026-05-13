import { useEffect, useRef } from 'react';
import styles from './ExerciseSVG.module.css';

// 6가지 운동의 SVG 스틱피규어 + 자체 애니메이션
// type: 'jumping-jack' | 'jog' | 'squat' | 'burpee' | 'running' | 'free'
// 'burpee'는 MP4 영상 렌더링 (다른 운동들도 점진적으로 영상 전환 가능)
export default function ExerciseSVG({ type = 'jumping-jack', size = 130, paused = false }) {
  const baseClass = paused ? styles.paused : '';
  const props = { viewBox: '0 0 100 100', width: size, height: size };

  if (type === 'burpee') {
    return <ExerciseVideo src="/exercises/burpee.mp4" size={size} paused={paused} />;
  }

  if (type === 'jumping-jack') {
    return (
      <svg className={`${styles.jj} ${baseClass}`} {...props}>
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
      <svg className={`${styles.jog} ${baseClass}`} {...props}>
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
      <svg className={`${styles.squat} ${baseClass}`} {...props}>
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
      <svg className={`${styles.running} ${baseClass}`} {...props}>
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
      <svg className={`${styles.free} ${baseClass}`} {...props}>
        <circle className={styles.freeHead} cx="50" cy="22" r="7" fill="#f47730" />
        <rect x="46" y="30" width="8" height="22" rx="2" fill="#f47730" />
        <line className={styles.freeArmL} x1="50" y1="35" x2="34" y2="20" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line className={styles.freeArmR} x1="50" y1="35" x2="66" y2="20" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="55" x2="44" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="55" x2="56" y2="78" stroke="#f47730" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

// 영상 기반 운동 동작 (autoplay + loop + muted, paused prop과 동기화)
function ExerciseVideo({ src, size, paused }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (paused) {
      el.pause();
    } else {
      // iOS Safari가 autoplay 정책으로 거부할 수 있어 catch
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }, [paused]);

  return (
    <video
      ref={ref}
      src={src}
      width={size}
      height={size}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-label="exercise demonstration"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        borderRadius: '50%',
      }}
    />
  );
}
