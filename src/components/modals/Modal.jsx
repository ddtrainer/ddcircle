import { useEffect } from 'react';
import styles from './Modal.module.css';

// 공통 모달 — 오버레이 클릭 또는 X로 닫힘. ESC 키도 닫힘.
// open: bool, onClose: fn, children: 모달 내용
export default function Modal({ open, onClose, children, cardClassName }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    // 모달 열려있는 동안 body 스크롤 방지
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={`${styles.overlay} ${open ? styles.show : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.card} ${cardClassName || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}
