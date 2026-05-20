import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SLOTS = [
  { id: 'default-morning', time: '09:00', icon: '🌅' },
  { id: 'default-evening', time: '18:00', icon: '🌇' },
];

function todayStr(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 슬롯 시간과 현재 시간 차이(분) — 양수면 지났음
function minutesDiff(now, slotTime) {
  const [h, m] = slotTime.split(':').map(Number);
  return (now.getHours() - h) * 60 + (now.getMinutes() - m);
}

export function useSetAlerts({ setTiming, onAlert }) {
  const [history, setHistory] = useLocalStorage('ddcircle.setAlertHistory', {});
  const onAlertRef = useRef(onAlert);
  const historyRef = useRef(history);

  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);
  useEffect(() => { historyRef.current = history; }, [history]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const today = todayStr(now);

      const lastSessionDate = (() => {
        try { return localStorage.getItem('ddcircle.lastSessionDate'); } catch { return null; }
      })();
      if (lastSessionDate === today) return;

      const userSlots = [];
      if (setTiming.morning?.enabled) userSlots.push({ id: 'morning', time: setTiming.morning.time, icon: '🌅' });
      if (setTiming.evening?.enabled) userSlots.push({ id: 'evening', time: setTiming.evening.time, icon: '🌇' });
      const slots = userSlots.length > 0 ? userSlots : DEFAULT_SLOTS;

      slots.forEach((slot) => {
        const diff = minutesDiff(now, slot.time);
        // 슬롯 시간 ~ 30분 이내: 사용자가 시작하지 않으면 5분마다 반복
        const inWindow = diff >= 0 && diff <= 30;
        const key = `${slot.id}|${today}`;
        if (inWindow) {
          const lastFiredAt = historyRef.current[key]; // 타임스탬프 or undefined
          const msSinceFired = lastFiredAt ? now - lastFiredAt : Infinity;
          if (msSinceFired >= 5 * 60 * 1000) {
            setHistory((prev) => ({ ...prev, [key]: now.getTime() }));
            onAlertRef.current?.(slot);
          }
        }
      });
    };

    check();
    const id = setInterval(check, 30000);

    // 탭이 다시 포그라운드로 돌아올 때 즉시 재확인 (백그라운드 지연 보정)
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [setTiming, setHistory]);
}
