import { createContext, useContext, useState, useCallback, useRef } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

// 어디서든 useToast().show('✦', '메시지')로 호출
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ icon: '', msg: '', visible: false });
  const timerRef = useRef(null);

  const show = useCallback((icon, msg, duration = 2500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ icon, msg, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className={`${styles.toast} ${toast.visible ? styles.show : ''}`}>
        <span className={styles.icon}>{toast.icon}</span>
        <span className={styles.msg}>{toast.msg}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
