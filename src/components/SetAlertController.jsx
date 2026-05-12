import { useState } from 'react';
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
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeSlot, setActiveSlot] = useState(null);

  useSetAlerts({
    setTiming,
    onAlert: (slot) => {
      // 인앱 모달 표시
      setActiveSlot(slot);

      // 브라우저 알림 (권한 허용 + 페이지가 백그라운드일 때 가장 효과적)
      try {
        if (
          notificationsEnabled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          const slotName = t(slot.id === 'morning' ? 'morning' : 'evening');
          const title = `${slot.icon} ${t('setAlertTitle').replace('{slot}', slotName)}`;
          const body = t('setAlertSub');
          const n = new Notification(title, {
            body,
            icon: '/dd-logo.png',
            badge: '/dd-logo.png',
            tag: `ddcircle-set-${slot.id}`,
          });
          n.onclick = () => {
            window.focus();
            navigate('/picker');
            n.close();
          };
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
