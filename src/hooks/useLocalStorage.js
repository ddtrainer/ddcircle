import { useState, useEffect } from 'react';

// localStorage에 자동 저장되는 useState
// const [val, setVal] = useLocalStorage('ddcircle.ep', 0);
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

// sessionStorage에 자동 저장되는 useState — 탭 닫으면 사라지는 일시적 상태
// 진행 중인 세션 흐름(운동/호흡)이 새로고침되어도 살아남도록.
export function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}
