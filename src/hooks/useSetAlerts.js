import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SLOTS = [
  { id: 'default-morning', time: '09:00', icon: '🌅' },
  { id: 'default-evening', time: '18:00', icon: '🌇' },
];

function todayStr(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 슬롯 시간의 오늘 Date ms 반환
function slotMs(now, slotTime) {
  const [h, m] = slotTime.split(':').map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0).getTime();
}

export function useSetAlerts({ setTiming, onAlert }) {
  const [history, setHistory] = useLocalStorage('ddcircle.setAlertHistory', {});
  const onAlertRef = useRef(onAlert);
  const historyRef = useRef(history);

  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);
  useEffect(() => { historyRef.current = history; }, [history]);

  useEffect(() => {
    let timerId = null;

    const getSlots = () => {
      const userSlots = [];
      if (setTiming.morning?.enabled) userSlots.push({ id: 'morning', time: setTiming.morning.time, icon: '🌅' });
      if (setTiming.evening?.enabled) userSlots.push({ id: 'evening', time: setTiming.evening.time, icon: '🌇' });
      return userSlots.length > 0 ? userSlots : DEFAULT_SLOTS;
    };

    const scheduleNext = (now) => {
      clearTimeout(timerId);
      const slots = getSlots();
      let minDelay = Infinity;

      slots.forEach((slot) => {
        const sm = slotMs(now, slot.time);
        const diffMs = now.getTime() - sm; // 양수 = 지났음

        if (diffMs < 0) {
          // 슬롯 시간 전 → 정확히 슬롯 시간에 예약 (+200ms 버퍼)
          const delay = -diffMs + 200;
          if (delay < minDelay) minDelay = delay;
        } else if (diffMs <= 30 * 60 * 1000) {
          // 슬롯 시간 ~ 30분 이내: 반복 예약 (5분마다)
          const today = todayStr(now);
          const key = `${slot.id}|${today}`;
          const lastFiredAt = historyRef.current[key];
          if (lastFiredAt) {
            const msToRepeat = 5 * 60 * 1000 - (now.getTime() - lastFiredAt);
            if (msToRepeat > 0 && msToRepeat < minDelay) minDelay = msToRepeat;
          }
        } else {
          // 30분 초과 → 내일 슬롯 시간까지 예약
          const nextDay = sm + 24 * 60 * 60 * 1000;
          const delay = nextDay - now.getTime() + 200;
          if (delay < minDelay) minDelay = delay;
        }
      });

      // 슬롯 없거나 계산 실패 시 1분 폴백
      const delay = Math.max(1000, minDelay === Infinity ? 60000 : minDelay);
      timerId = setTimeout(check, delay);
    };

    const check = () => {
      const now = new Date();
      const today = todayStr(now);

      // 오늘 이미 세션 완료 시 다음 슬롯만 예약
      try {
        if (localStorage.getItem('ddcircle.lastSessionDate') === today) {
          scheduleNext(now);
          return;
        }
      } catch { /* ignore */ }

      const slots = getSlots();

      slots.forEach((slot) => {
        const sm = slotMs(now, slot.time);
        const diffMs = now.getTime() - sm; // 양수 = 지났음

        // 슬롯 시간 ~ 30분 이내
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

      scheduleNext(now);
    };

    check();

    // 탭이 포그라운드로 돌아올 때 즉시 재확인
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [setTiming, setHistory]);
}
