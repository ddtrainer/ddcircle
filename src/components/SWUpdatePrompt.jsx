import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { useLang } from '../i18n/LangContext';
import styles from './PWAInstallPrompt.module.css';

// 서비스 워커 자동 등록 + 새 버전 배포 시 사용자에게 새로고침 안내
export default function SWUpdatePrompt() {
  const { t } = useLang();
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        // 오프라인 사용 가능 — 조용히 무시 (필요 시 토스트 띄울 수 있음)
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
      <img src="/dd-logo.png" alt="DDCircle" className={styles.icon} />
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
