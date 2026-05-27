import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { useLang } from '../i18n/LangContext';
import styles from './PWAInstallPrompt.module.css';

// 서비스 워커 자동 등록 + 새 버전 배포 시 자동 리로드 (PWA 옛 JS 캐싱 방지)
export default function SWUpdatePrompt() {
  const { t } = useLang();
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  useEffect(() => {
    // 새 SW가 컨트롤 잡으면 한 번만 자동 리로드 — PWA에서 옛 JS가 계속
    // 돌아가는 문제 차단. 무한 리로드 방지를 위해 플래그로 1회 제한.
    if ('serviceWorker' in navigator) {
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    }

    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        // 오프라인 사용 가능 — 조용히 무시
      },
    });
    setUpdateSW(() => update);
  }, []);

  if (!needRefresh) return null;

  const handleRefresh = () => {
    if (updateSW) updateSW(true);
  };

  return (
    <div className={styles.banner}>
      <button
        className={styles.close}
        onClick={() => setNeedRefresh(false)}
        aria-label="Close"
      >×</button>
      <img src="/dd-logo-192.png" alt="DDCircle" className={styles.icon} />
      <div className={styles.text}>
        <div className={styles.title}>{t('swUpdateTitle')}</div>
        <div className={styles.sub}>{t('swUpdateSub')}</div>
      </div>
      <button className={styles.btn} onClick={handleRefresh}>
        {t('swUpdateBtn')}
      </button>
    </div>
  );
}
