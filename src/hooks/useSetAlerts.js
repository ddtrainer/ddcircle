import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SLOTS = [
  { id: 'default-morning', time: '09:00', icon: '🌅' },
  { id: 'default-evening', time: '18:00', icon: '🌇' },
];

function todayStr(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function slotMs(now, slotTime) {
  const [h, m] = slotTime.split(':').map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0).getTime();
}

export function useSetAlerts({ setTiming, onAlert }) {
  const [history, setHistory] = useLocalStorage('ddcircle.setAlertHistory', {});
  const onAlertRef = useRef(onAlert);
  const historyRef = useRef(history);
  const setTimingRef = useRef(setTiming);

  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { setTimingRef.current = setTiming; }, [setTiming]);

  useEffect(() => {
    let timerId = null;
    let pollId = null;
    let rafId = null;
    let lastCheckTime = 0;

    const getSlots = () => {
      const t = setTimingRef.current;
      const userSlots = [];
      if (t.morning?.enabled) userSlots.push({ id: 'morning', time: t.morning.time, icon: '🌅' });
      if (t.evening?.enabled) userSlots.push({ id: 'evening', time: t.evening.time, icon: '🌇' });
      return userSlots.length > 0 ? userSlots : DEFAULT_SLOTS;
    };

    const tryFireAlerts = (now) => {
      const today = todayStr(now);
      try {
        if (localStorage.getItem('ddcircle.lastSessionDate') === today) return;
      } catch { /* ignore */ }

      const slots = getSlots();
      slots.forEach((slot) => {
        const sm = slotMs(now, slot.time);
        const diffMs = now.getTime() - sm;
        if (diffMs >= 0 && diffMs <= 30 * 60 * 1000) {
          const key = `${slot.id}|${today}`;
          const lastFiredAt = historyRef.current[key];
          const msSinceFired = lastFiredAt ? now.getTime() - lastFiredAt : Infinity;
          if (msSinceFired >= 5 * 60 * 1000) {
            setHistory((prev) => ({ ...prev, [key]: now.getTime() }));
            onAlertRef.current?.(slot);
          }
        }
      });
    };

    const scheduleNext = (now) => {
      clearTimeout(timerId);
      const slots = getSlots();
      let minDelay = Infinity;

      slots.forEach((slot) => {
        const sm = slotMs(now, slot.time);
        const diffMs = now.getTime() - sm;

        if (diffMs < 0) {
          const delay = -diffMs + 200;
          if (delay < minDelay) minDelay = delay;
        } else if (diffMs <= 30 * 60 * 1000) {
          const today = todayStr(now);
          const key = `${slot.id}|${today}`;
          const lastFiredAt = historyRef.current[key];
          if (lastFiredAt) {
            const msToRepeat = 5 * 60 * 1000 - (now.getTime() - lastFiredAt);
            if (msToRepeat > 0 && msToRepeat < minDelay) minDelay = msToRepeat;
          }
        } else {
          const nextDay = sm + 24 * 60 * 60 * 1000;
          const delay = nextDay - now.getTime() + 200;
          if (delay < minDelay) minDelay = delay;
        }
      });

      const delay = Math.max(1000, minDelay === Infinity ? 60000 : minDelay);
      timerId = setTimeout(check, delay);
    };

    const check = () => {
      const now = new Date();
      lastCheckTime = now.getTime();
      tryFireAlerts(now);
      scheduleNext(now);
    };

    // 모든 검사 진입점 — 최소 1초 간격 디바운스
    const recheck = () => {
      const nowMs = Date.now();
      if (nowMs - lastCheckTime < 1000) return;
      check();
    };

    check();

    // 폴백 인터벌: 모바일 OS의 setTimeout 스로틀링 대비 (15초)
    pollId = setInterval(recheck, 15000);

    // requestAnimationFrame 기반 백업 체크 — 60초마다
    // 모바일 브라우저가 setInterval보다 rAF를 더 안정적으로 유지하는 경우 대비
    let rafLastCheck = Date.now();
    const rafTick = () => {
      const nowMs = Date.now();
      if (nowMs - rafLastCheck >= 60000) {
        rafLastCheck = nowMs;
        recheck();
      }
      rafId = requestAnimationFrame(rafTick);
    };
    rafId = requestAnimationFrame(rafTick);

    // 사용자 상호작용/포커스/가시성 변경 시 즉시 재확인
    // 모바일에서 사용자가 화면을 만지면 슬롯 시간이 지났는지 즉시 체크
    const onVisible = () => { if (document.visibilityState === 'visible') recheck(); };
    const onFocus = () => recheck();
    const onTouch = () => recheck();
    const onPageShow = () => recheck();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('click', onTouch);
    document.addEventListener('scroll', onTouch, { passive: true });

    return () => {
      clearTimeout(timerId);
      clearInterval(pollId);
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('click', onTouch);
      document.removeEventListener('scroll', onTouch);
    };
    // setTiming은 ref로 읽으므로 deps에서 제외 — 매번 effect 재실행 방지
  }, [setHistory]);
}
