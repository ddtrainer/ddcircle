import { useEffect, useRef, useState } from 'react';

// Dash 60초 타이머 훅. 1초마다 감소, paused면 정지, 0 도달 시 onComplete 호출.
// 마일스톤(55/40/20/10/5)에서 onMilestone(seconds) 호출 — 가이드 메시지 트리거
export function useDashTimer({ initial = 60, onComplete, onMilestone }) {
  const [seconds, setSeconds] = useState(initial);
  const [paused, setPaused] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onMilestoneRef = useRef(onMilestone);

  // 콜백 ref 동기화 (의존성 배열에 콜백 안 넣어도 최신값 사용)
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onMilestoneRef.current = onMilestone; }, [onMilestone]);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (paused) return prev;
        const next = prev - 1;
        // 마일스톤 트리거
        if ([55, 40, 20, 10, 5].includes(next)) {
          onMilestoneRef.current?.(next);
        }
        if (next <= 0 && !completedRef.current) {
          completedRef.current = true;
          // 다음 tick에서 onComplete (state 업데이트 이후)
          setTimeout(() => onCompleteRef.current?.(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  return {
    seconds,
    paused,
    togglePause: () => setPaused((p) => !p),
    skip: () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.();
    },
  };
}
