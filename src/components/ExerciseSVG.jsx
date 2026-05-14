import { useEffect, useRef, useState } from 'react';

// 6가지 운동 동작 영상 (MP4, 정사각형, 5~10초 루프)
// type: 'jumping-jack' | 'jog' | 'squat' | 'burpee' | 'running' | 'free'
// 컴포넌트 이름은 호환성을 위해 ExerciseSVG로 유지 (실제로는 영상 렌더링)
const VIDEO_MAP = {
  'jumping-jack': '/exercises/jumping-jack.mp4',
  'jog': '/exercises/jog.mp4',
  'squat': '/exercises/squat.mp4',
  'burpee': '/exercises/burpee.mp4',
  'running': '/exercises/running.mp4',
  'free': '/exercises/free.mp4',
};

export default function ExerciseSVG({ type = 'jumping-jack', size = 130, paused = false }) {
  const src = VIDEO_MAP[type];
  if (!src) return null;
  return <ExerciseVideo src={src} size={size} paused={paused} />;
}

// 영상 기반 운동 동작 (autoplay + loop + muted, paused prop과 동기화)
// 첫 프레임 준비 전 검은 화면 방지: 투명 배경 + 페이드 인
function ExerciseVideo({ src, size, paused }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

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
      onLoadedData={() => setReady(true)}
      onCanPlay={() => setReady(true)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        borderRadius: '50%',
        // 검은 배경 방지 — 부모의 베이지 원이 비치도록 투명 처리
        backgroundColor: 'transparent',
        // 첫 프레임 준비될 때까지 숨김 → 준비 시점에 0.25초 페이드 인
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    />
  );
}
