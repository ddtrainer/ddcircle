import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLang } from '../i18n/LangContext';
import { useSetAlerts } from '../hooks/useSetAlerts';
import SetAlertModal from './SetAlertModal';

// 타이밍 도달 시 bell-in.mp3 재생 — 권한 불필요, 탭 열려있을 때 항상 작동
function playAlertBell() {
  try {
    const audio = new Audio('/audio/bell-in.mp3');
    audio.volume = 0.9;
    audio.play().catch(() => {
      // 자동재생 정책으로 막힌 경우 Web Audio API 폴백 (딩동 2회)
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const bell = (freq, t0) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.6, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2);
          osc.start(t0);
          osc.stop(t0 + 1.2);
        };
        bell(880, ctx.currentTime);
        bell(660, ctx.currentTime + 0.35);
        bell(880, ctx.currentTime + 1.3);
        bell(660, ctx.currentTime + 1.65);
        setTimeout(() => ctx.close(), 4000);
      } catch { /* 무시 */ }
    });
  } catch { /* 무시 */ }
}

// 셋 알림 컨트롤러
// - 인앱 모달 + 알림음 (탭 열려있을 때)
// - OS 푸시 알림 (권한 허용 시, 백그라운드 보조)
export default function SetAlertController() {
  const { setTiming, notificationsEnabled } = useApp();

  // 앱 진입 시 OS 알림 권한 자동 요청
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
      // 1) 알림음 재생 — 탭 열려있을 때 즉시 소리
      playAlertBell();

      // 2) 인앱 모달 표시
      setActiveSlot(slot);

      // 3) OS 푸시 알림 — 권한 있을 때 보조 (백그라운드 대비)
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
        /* iOS Safari 등 Notification 미지원 환경 — 무시 */
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
