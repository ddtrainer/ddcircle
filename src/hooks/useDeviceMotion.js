import { useCallback, useRef, useState } from 'react';

// DeviceMotion 지원 여부 (데스크톱/미지원 브라우저 판별)
export function deviceMotionSupported() {
  return typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined';
}

// iOS 13+ 는 명시적 권한 요청 필요 (requestPermission 존재)
export function motionNeedsPermission() {
  return typeof DeviceMotionEvent !== 'undefined'
    && typeof DeviceMotionEvent.requestPermission === 'function';
}

// DeviceMotion 구독 훅.
// - requestPermission(): iOS는 반드시 '버튼 클릭 이벤트 콜스택 안'에서 호출해야 함.
// - start(onSample): accelerationIncludingGravity (x,y,z, ts=performance.now) 콜백.
// - stop(): 리스너 해제 (측정 종료/페이지 이탈 시).
export function useDeviceMotion() {
  const handlerRef = useRef(null);
  const [permission, setPermission] = useState('unknown'); // unknown|granted|denied|unsupported

  const requestPermission = useCallback(async () => {
    if (!deviceMotionSupported()) { setPermission('unsupported'); return 'unsupported'; }
    if (motionNeedsPermission()) {
      try {
        const res = await DeviceMotionEvent.requestPermission();
        const ok = res === 'granted';
        setPermission(ok ? 'granted' : 'denied');
        return ok ? 'granted' : 'denied';
      } catch {
        setPermission('denied');
        return 'denied';
      }
    }
    setPermission('granted'); // Android 등 권한 팝업 없이 허용
    return 'granted';
  }, []);

  const start = useCallback((onSample) => {
    const h = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      onSample(a.x || 0, a.y || 0, a.z || 0, performance.now());
    };
    handlerRef.current = h;
    window.addEventListener('devicemotion', h);
  }, []);

  const stop = useCallback(() => {
    if (handlerRef.current) {
      window.removeEventListener('devicemotion', handlerRef.current);
      handlerRef.current = null;
    }
  }, []);

  return { permission, requestPermission, start, stop };
}
