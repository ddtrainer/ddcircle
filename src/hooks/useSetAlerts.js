import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

// 셋 시간 도달 시 onAlert(slot) 호출. 30초마다 체크. 같은 슬롯/같은 날은 1회만.
// slot = { id: 'morning'|'evening', time: 'HH:MM', name, icon }
export function useSetAlerts({ setTiming, onAlert }) {
  const [history, setHistory] = useLocalStorage('ddcircle.setAlertHistory', {});
  const onAlertRef = useRef(onAlert);

  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const today =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const slots = [];
      if (setTiming.morning?.enabled) {
        slots.push({ id: 'morning', time: setTiming.morning.time, icon: '🌅' });
      }
      if (setTiming.evening?.enabled) {
        slots.push({ id: 'evening', time: setTiming.evening.time, icon: '🌇' });
      }

      slots.forEach((slot) => {
        const [h, m] = slot.time.split(':').map(Number);
        // 분 단위 정확히 일치하는 순간 (30초 폴링이라 최대 30s 지연)
        const matches = now.getHours() === h && now.getMinutes() === m;
        const key = `${slot.id}|${today}`;
        if (matches && !history[key]) {
          setHistory((prev) => ({ ...prev, [key]: true, _cleanedAt: today }));
          onAlertRef.current?.(slot);
        }
      });
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [setTiming, history, setHistory]);
}
