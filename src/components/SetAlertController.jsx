import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLang } from '../i18n/LangContext';
import { useSetAlerts } from '../hooks/useSetAlerts';
import SetAlertModal from './SetAlertModal';

// 셋 알림 컨트롤러
// - 인앱 모달 (앱 열려있을 때)
// - 브라우저 푸시 알림 (권한 허용 + 탭 백그라운드 시)
export default function SetAlertController() {
  const { setTiming, notificationsEnabled } = useApp();

  // 앱 진입 시 OS 알림 권한 자동 요청 (notificationsEnabled 기본 true)
  // — iOS Safari는 Notification 미지원이므로 조용히 무시
  useEffect(() => {
    if (
      notificationsEnabled &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, [notificationsEnabled]);
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeSlot, setActiveSlot] = useState(null);

  useSetAlerts({
    setTiming,
    onAlert: (slot) => {
      // 인앱 모달 표시
      setActiveSlot(slot);

      // 브라우저 알림 — 서비스 워커 우선 (Android Chrome PWA에서 더 안정적), 폴백은 Notification API
      try {
        if (
          notificationsEnabled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          const slotName = t(slot.id === 'morning' ? 'morning' : 'evening');
          const title = `${slot.icon} ${t('setAlertTitle').replace('{slot}', slotName)}`;
          const body = t('setAlertSub');
          const options = {
            body,
            icon: '/dd-logo-128.png',
            badge: '/dd-logo-128.png',
            tag: `ddcircle-set-${slot.id}`,
            data: { url: '/picker' },
          };
          if (navigator.serviceWorker?.getRegistration) {
            navigator.serviceWorker.getRegistration().then((reg) => {
              if (reg?.showNotification) {
                reg.showNotification(title, options);
              } else {
                const n = new Notification(title, options);
                n.onclick = () => { window.focus(); navigate('/picker'); n.close(); };
              }
            });
          } else {
            const n = new Notification(title, options);
            n.onclick = () => { window.focus(); navigate('/picker'); n.close(); };
          }
        }
      } catch {
        /* 일부 환경(특히 iOS Safari)은 Notification 미지원 — 무시 */
      }
    },
  });

  const handleStart = () => {
    setActiveSlot(null);
    navigate('/picker');
  };
  const handleLater = () => setActiveSlot(null);

  return (
    <SetAlertModal
      open={!!activeSlot}
      slot={activeSlot}
      onStart={handleStart}
      onLater={handleLater}
    />
  );
}
