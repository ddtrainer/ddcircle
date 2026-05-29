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
  'mountain-climber': '/exercises/mountain-climber.mp4',
};

// Lottie(JSON) 기반 동작 — 기존 6개 MP4와는 별도 렌더 경로. 기존 영상은 절대 건드리지 않음.
const LOTTIE_MAP = {
  'pushup': '/exercises/pushup.json',
};

export default function ExerciseSVG({ type = 'jumping-jack', size = 130, paused = false }) {
  const lottieSrc = LOTTIE_MAP[type];
  if (lottieSrc) return <ExerciseLottie src={lottieSrc} size={size} paused={paused} />;
  const src = VIDEO_MAP[type];
  if (!src) return null;
  // 마운틴 클라이머 원본 영상은 인물이 왼쪽을 향함 → 좌우 반전해 오른쪽을 보게 함
  const flipX = type === 'mountain-climber';
  return <ExerciseVideo src={src} size={size} paused={paused} flipX={flipX} />;
}

// Lottie 애니메이션 렌더 (autoplay + loop, paused prop과 동기화)
function ExerciseLottie({ src, size, paused }) {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let anim = null;
    (async () => {
      const lottie = (await import('lottie-web')).default;
      if (cancelled || !containerRef.current) return;
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: src,
      });
      anim.addEventListener('DOMLoaded', () => setReady(true));
      animRef.current = anim;
    })();
    return () => {
      cancelled = true;
      if (anim) anim.destroy();
      animRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (paused) anim.pause();
    else anim.play();
  }, [paused, ready]);

  return (
    <div
      ref={containerRef}
      aria-label="exercise demonstration"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    />
  );
}

// 영상 기반 운동 동작 (autoplay + loop + muted, paused prop과 동기화)
// 첫 프레임 준비 전 검은 화면 방지: 투명 배경 + 페이드 인
function ExerciseVideo({ src, size, paused, flipX = false }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  // React의 muted prop은 일부 환경에서 DOM HTML 속성으로 반영 안 됨 → autoplay 정책 차단.
  // ref로 property + attribute 양쪽 모두 강제하여 모든 브라우저에서 muted 인식 보장.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (paused) {
      el.pause();
    } else {
      const tryPlay = () => {
        const p = el.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      };
      tryPlay();
      // autoplay 정책으로 거부되면 첫 사용자 상호작용 시 재시도
      const retry = () => {
        tryPlay();
        document.removeEventListener('touchstart', retry);
        document.removeEventListener('click', retry);
      };
      document.addEventListener('touchstart', retry, { once: true, passive: true });
      document.addEventListener('click', retry, { once: true });
      return () => {
        document.removeEventListener('touchstart', retry);
        document.removeEventListener('click', retry);
      };
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
      defaultMuted
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
        backgroundColor: 'transparent',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
        transform: flipX ? 'scaleX(-1)' : undefined,
      }}
    />
  );
}
