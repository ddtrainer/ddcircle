import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { enablePushSubscription, disablePushSubscription } from '../../lib/pushSubscription';
import Modal from './Modal';
import styles from './SetTimingModal.module.css';

// 셋 타이밍(아침/저녁 알림 시간) 설정 모달
export default function SetTimingModal({ open, onClose }) {
  const { t, lang } = useLang();
  const { setTiming, setSetTiming, notificationsEnabled, setNotificationsEnabled } = useApp();
  const { user } = useAuth();
  const { show: showToast } = useToast();

  // 모달 내부 임시 상태 — 저장 누르기 전까지는 컨텍스트에 반영 X
  const [draft, setDraft] = useState(setTiming);
  const [draftNotif, setDraftNotif] = useState(notificationsEnabled);

  // 푸시 알림 토글 — 항상 상태 변경 가능 (인앱 알림은 권한과 무관)
  // 브라우저 푸시 권한은 ON 시도 시 best-effort로 요청. (Pi 전용 — 로그인 유도 제거)
  const toggleNotif = async () => {
    const turningOn = !draftNotif;
    setDraftNotif(turningOn); // 무조건 상태 반영 (시각적 즉시 반응)

    // ON 시도 시 브라우저 푸시 권한 추가 요청 (선택 사항)
    if (turningOn) {
      if (typeof Notification === 'undefined') {
        showToast('💡', t('notifInAppOnly'));
        return;
      }
      if (Notification.permission === 'granted') {
        showToast('🔔', t('notifEnabled'));
        return;
      }
      if (Notification.permission === 'denied') {
        // 권한 거부됐어도 인앱 알림은 작동
        showToast('💡', t('notifBlockedInAppOnly'));
        return;
      }
      // 'default' 상태 — 권한 요청
      try {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          showToast('🔔', t('notifEnabled'));
        } else {
          // 사용자가 거부했어도 인앱 알림 켜놨으니 OK
          showToast('💡', t('notifInAppOnly'));
        }
      } catch {
        showToast('💡', t('notifInAppOnly'));
      }
    }
  };

  // 모달 열릴 때마다 현재 값으로 동기화
  useEffect(() => {
    if (open) {
      setDraft(setTiming);
      setDraftNotif(notificationsEnabled);
    }
  }, [open, setTiming, notificationsEnabled]);

  const updateSlot = (slot, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], [key]: value },
    }));
  };

  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSetTiming(draft);
    setNotificationsEnabled(draftNotif);
    // 타이밍 저장 = 재테스트 신호. 슬롯 충족·발사 기록 초기화.
    try {
      localStorage.removeItem('ddcircle.slotsSatisfied');
      localStorage.removeItem('ddcircle.setAlertHistory');
    } catch { /* ignore */ }

    // Web Push 구독 동기화 — 모달은 구독 완료까지 열어둠.
    // 권한 팝업과 모달 백드롭 충돌 회피 + 실패 시 사용자에게 토스트로 안내.
    let pushOk = true;
    if (draftNotif) {
      const result = await enablePushSubscription({
        setTiming: draft,
        userId: user?.id,
        lang,
        onError: (msg) => {
          pushOk = false;
          showToast('⚠️', t('pushSetupFailedToast', { msg }));
        },
      });
      if (result) pushOk = true;
    } else {
      try { await disablePushSubscription(); } catch (e) { console.error('[push] disable failed', e); }
    }

    if (pushOk) showToast('⏰', t('setTimingSaved'));
    setSaving(false);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>{t('modalSetTitle')}</div>
      <div
        className={styles.sub}
        dangerouslySetInnerHTML={{ __html: t('modalSetSub') }}
      />

      {/* 아침 셋 */}
      <div className={styles.timeSlot}>
        <div className={styles.slotInfo}>
          <div className={styles.slotIcon}>🌅</div>
          <div>
            <div className={styles.slotLabel}>{t('morningLabel')}</div>
            <input
              type="time"
              className={styles.timeInput}
              value={draft.morning.time}
              onChange={(e) => updateSlot('morning', 'time', e.target.value)}
            />
          </div>
        </div>
        <div
          className={`${styles.toggle} ${draft.morning.enabled ? styles.on : ''}`}
          onClick={() => updateSlot('morning', 'enabled', !draft.morning.enabled)}
        />
      </div>

      {/* 저녁 셋 */}
      <div className={styles.timeSlot}>
        <div className={styles.slotInfo}>
          <div className={styles.slotIcon}>🌇</div>
          <div>
            <div className={styles.slotLabel}>{t('eveningLabel')}</div>
            <input
              type="time"
              className={styles.timeInput}
              value={draft.evening.time}
              onChange={(e) => updateSlot('evening', 'time', e.target.value)}
            />
          </div>
        </div>
        <div
          className={`${styles.toggle} ${draft.evening.enabled ? styles.on : ''}`}
          onClick={() => updateSlot('evening', 'enabled', !draft.evening.enabled)}
        />
      </div>

      {/* 푸시 알림 받기 */}
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          📱 {t('notifLabel')}
          <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {t('notifHint')}
          </span>
        </span>
        <div
          className={`${styles.toggle} ${draftNotif ? styles.on : ''}`}
          onClick={toggleNotif}
        />
      </div>

      <button className={styles.saveBtn} onClick={save} disabled={saving}>
        {saving ? '...' : t('saveBtn')}
      </button>
    </Modal>
  );
}
