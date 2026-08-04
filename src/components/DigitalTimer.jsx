import styles from './DigitalTimer.module.css';

// Dash 운동용 큰 디지털 카운트다운 (예: "0:47").
// 운동 중 잠깐 시선만 줘도 남은 시간을 읽을 수 있게 화면에서 가장 크게.
export default function DigitalTimer({ seconds = 0, label, urgent = false }) {
  const s = Math.max(0, Math.round(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const text = `${mm}:${ss < 10 ? '0' : ''}${ss}`;

  return (
    <div className={styles.wrap}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={`${styles.time} ${urgent ? styles.urgent : ''}`}>{text}</div>
    </div>
  );
}
