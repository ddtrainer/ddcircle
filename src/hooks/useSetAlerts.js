import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

// 기본 알림 시간 — 사용자가 morning/evening을 둘 다 설정하지 않은 경우 자동 적용
const DEFAULT_SLOTS = [
  { id: 'default-morning', time: '09:00', icon: '🌅' },
  { id: 'default-evening', time: '18:00', icon: '🌇' },
];

// 오늘 날짜 문자열 (로컬 타임존 기준 YYYY-MM-DD)
function todayStr(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 셋 시간 도달 시 onAlert(slot) 호출. 30초마다 체크.
// - 같은 슬롯/같은 날은 1회만
// - 오늘 세션 이미 완료했으면 알림 안 함
// - 사용자가 morning/evening 모두 미설정 시 기본 슬롯(09:00, 18:00) 사용
// slot = { id, time: 'HH:MM', icon }
export function useSetAlerts({ setTiming, onAlert }) {
  const [history, setHistory] = useLocalStorage('ddcircle.setAlertHistory', {});
  const onAlertRef = useRef(onAlert);

  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const today = todayStr(now);

      // 오늘 이미 세션 했으면 알림 발사 안 함 (날짜 기반 정확 비교)
      const lastSessionDate = (() => {
        try { return localStorage.getItem('ddcircle.lastSessionDate'); }
        catch { return null; }
      })();
      const sessionDoneToday = lastSessionDate === today;
      if (sessionDoneToday) return;

      // 사용자 설정 슬롯 수집
      const userSlots = [];
      if (setTiming.morning?.enabled) {
        userSlots.push({ id: 'morning', time: setTiming.morning.time, icon: '🌅' });
      }
      if (setTiming.evening?.enabled) {
        userSlots.push({ id: 'evening', time: setTiming.evening.time, icon: '🌇' });
      }
      // 사용자가 아무것도 설정 안 했으면 기본 슬롯 사용
      const slots = userSlots.length > 0 ? userSlots : DEFAULT_SLOTS;

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
