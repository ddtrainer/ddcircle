import styles from './ProgressDots.module.css';

// 4단계 진행 표시점 (Deep → Dash → Proof → Complete)
// step: 1~4, 현재 단계
export default function ProgressDots({ step = 1, total = 4 }) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const cls =
          idx < step ? styles.done : idx === step ? styles.active : '';
        return <div key={idx} className={`${styles.dot} ${cls}`}></div>;
      })}
    </div>
  );
}
