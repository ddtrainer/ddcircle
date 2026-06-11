import { useEffect, useRef } from 'react';
import styles from './Celebration.module.css';

// 풀세트 완료 축하 — Canvas 폭죽 + 큰 글씨. 외부 라이브러리 없이 requestAnimationFrame으로 구현.
// open이면 mount 시 자동 재생, duration 후 onDone 호출(탭하면 즉시 닫기).
const COLORS = ['#ed3a4a', '#f47730', '#fbb040', '#7ed957', '#3bbfb0', '#1e9bd8', '#e85d8a'];

export default function Celebration({ text, duration = 2400, onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    let w = canvas.width = window.innerWidth * DPR;
    let h = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const particles = [];
    const burst = (cx, cy) => {
      const n = 38 + Math.floor(Math.random() * 22);
      const base = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.3;
        const speed = (2 + Math.random() * 4.5) * DPR;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          color: Math.random() < 0.3 ? COLORS[Math.floor(Math.random() * COLORS.length)] : base,
          life: 1,
          size: (1.6 + Math.random() * 2.4) * DPR,
        });
      }
    };

    // 시작 더블 버스트
    burst(w * 0.35, h * 0.3);
    burst(w * 0.65, h * 0.27);

    let start = null;
    let sinceBurst = 0;
    const frame = (ts) => {
      if (start == null) start = ts;
      const elapsed = ts - start;
      ctx.clearRect(0, 0, w, h);

      // 약 1.7초까지 주기적으로 추가 폭죽
      sinceBurst += 16;
      if (elapsed < 1700 && sinceBurst > 260) {
        sinceBurst = 0;
        burst(w * (0.15 + Math.random() * 0.7), h * (0.12 + Math.random() * 0.4));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.05 * DPR;        // 중력
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.012;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < duration || particles.length > 0) {
        rafRef.current = requestAnimationFrame(frame);
      }
    };
    rafRef.current = requestAnimationFrame(frame);

    const timer = setTimeout(() => onDone?.(), duration);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, [duration, onDone]);

  return (
    <div className={styles.overlay} onClick={() => onDone?.()} role="presentation">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.text}>{text}</div>
    </div>
  );
}
