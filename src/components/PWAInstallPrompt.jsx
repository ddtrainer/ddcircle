import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LangContext';
import styles from './PWAInstallPrompt.module.css';

const DISMISS_KEY = 'ddcircle.pwaDismissedAt';
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3일
const SHOW_DELAY_MS = 5000; // 첫 방문 후 5초 뒤 노출

function isStandalone() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari
  if (window.navigator.standalone) return true;
  return false;
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

export default function PWAInstallPrompt() {
  const { t } = useLang();
  const [deferred, setDeferred] = useState(null); // Android Chrome prompt event
  const [visible, setVisible] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return; // 이미 설치된 상태

    // 최근에 닫았으면 숨김
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      // 일정 시간 후 노출
      setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari는 beforeinstallprompt 없음 → 별도 가이드
    if (isIosSafari()) {
      setTimeout(() => setIosGuide(true), SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setIosGuide(false);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    if (choice?.outcome === 'accepted' || choice?.outcome === 'dismissed') {
      dismiss();
    }
    setDeferred(null);
  };

  // Android (또는 PWA 지원 브라우저)
  if (visible && deferred) {
    return (
      <div className={styles.banner}>
        <button className={styles.close} onClick={dismiss} aria-label="Close">×</button>
        <img src="/dd-logo.png" alt="DDCircle" className={styles.icon} />
        <div className={styles.text}>
          <div className={styles.title}>{t('pwaInstallTitle')}</div>
          <div className={styles.sub}>{t('pwaInstallSub')}</div>
        </div>
        <button className={styles.btn} onClick={install}>{t('pwaInstallBtn')}</button>
      </div>
    );
  }

  // iOS Safari
  if (iosGuide) {
    return (
      <div className={styles.banner}>
        <button className={styles.close} onClick={dismiss} aria-label="Close">×</button>
        <img src="/dd-logo.png" alt="DDCircle" className={styles.icon} />
        <div className={styles.text}>
          <div className={styles.title}>{t('pwaInstallTitle')}</div>
          <div className={styles.sub}>{t('pwaInstallIosGuide')}</div>
        </div>
      </div>
    );
  }

  return null;
}
