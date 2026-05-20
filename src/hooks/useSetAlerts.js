import { useEffect, useRef } from 'react';

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

// localStorage를 직접 읽고 쓴다. useLocalStorage(React state)와 분리한 이유:
// SetTimingModal에서 타이밍 저장 시 localStorage를 직접 비우는데, React state는
// 비워지지 않아 historyRef가 옛 값을 계속 참조하는 stale 버그가 있었음.
function readHistory() {
  try {
    return JSON.parse(localStorage.getItem('ddcircle.setAlertHistory') || '{}');
  } catch { return {}; }
}
function writeHistory(obj) {
  try { localStorage.setItem('ddcircle.setAlertHistory', JSON.stringify(obj)); } catch { /* ignore */ }
}
function readSatisfied() {
  try {
    return JSON.parse(localStorage.getItem('ddcircle.slotsSatisfied') || '{}');
  } catch { return {}; }
}

export function useSetAlerts({ setTiming, onAlert }) {
  const onAlertRef = useRef(onAlert);
  const setTimingRef = useRef(setTiming);

  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);
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
      const satisfied = readSatisfied();
      const history = readHistory();

      const slots = getSlots();
      slots.forEach((slot) => {
        if (satisfied[slot.id] === today) return; // 이 슬롯은 오늘 이미 충족
        const sm = slotMs(now, slot.time);
        const diffMs = now.getTime() - sm;
        if (diffMs >= 0 && diffMs <= 30 * 60 * 1000) {
          const key = `${slot.id}|${today}`;
          const lastFiredAt = history[key];
          const msSinceFired = lastFiredAt ? now.getTime() - lastFiredAt : Infinity;
          if (msSinceFired >= 5 * 60 * 1000) {
            writeHistory({ ...history, [key]: now.getTime() });
            onAlertRef.current?.(slot);
          }
        }
      });
    };

    const scheduleNext = (now) => {
      clearTimeout(timerId);
      const slots = getSlots();
      const history = readHistory();
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
          const lastFiredAt = history[key];
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

    const recheck = () => {
      const nowMs = Date.now();
      if (nowMs - lastCheckTime < 1000) return;
      check();
    };

    check();

    // 폴백 인터벌: 모바일 OS의 setTimeout 스로틀링 대비 (15초)
    pollId = setInterval(recheck, 15000);

    // requestAnimationFrame 기반 백업 — 60초마다
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

    // 사용자 상호작용/포커스/가시성 변경 시 즉시 재확인 (모바일 신뢰성)
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
  }, []);
}
