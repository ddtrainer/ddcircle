import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { fetchProfileByInviteCode, acceptInvite } from '../../lib/friends';
import Modal from './Modal';
import styles from './IncomingInviteModal.module.css';

const DEMO_INVITER = {
  nickname: '서울의 지수',
  emoji: '🌸',
  emoji_bg: 'linear-gradient(135deg,#fbb040,#f97b9c)',
};

export default function IncomingInviteModal({ open, onClose }) {
  const { t } = useLang();
  const { setUserEp, setPendingInvite, pendingInvite } = useApp();
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [inviter, setInviter] = useState(null);
  const [accepting, setAccepting] = useState(false);

  // pendingInvite의 코드로 초대자 프로필 조회
  useEffect(() => {
    if (!open || !pendingInvite?.code) return;
    let cancelled = false;
    (async () => {
      const profile = await fetchProfileByInviteCode(pendingInvite.code);
      if (!cancelled) setInviter(profile || DEMO_INVITER);
    })();
    return () => { cancelled = true; };
  }, [open, pendingInvite]);

  const displayName = inviter?.nickname || DEMO_INVITER.nickname;
  const emoji = inviter?.emoji || DEMO_INVITER.emoji;
  const emojiBg = inviter?.emoji_bg || DEMO_INVITER.emoji_bg;

  // 처리된 초대 코드를 localStorage에 기록 — 같은 URL 재방문 시 모달 안 뜸
  const markHandled = (code) => {
    if (!code) return;
    try {
      const handled = JSON.parse(localStorage.getItem('ddcircle.handledInvites') || '[]');
      if (!handled.includes(code)) {
        handled.push(code);
        // 최근 50개만 유지 (무한 증가 방지)
        const trimmed = handled.slice(-50);
        localStorage.setItem('ddcircle.handledInvites', JSON.stringify(trimmed));
      }
    } catch { /* ignore */ }
  };

  const accept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      // 인증 + 실제 초대자 프로필이 있으면 친구 관계 생성
      if (user && inviter?.id && pendingInvite?.code) {
        await acceptInvite(user.id, pendingInvite.code);
      }
      setUserEp((prev) => ({ ...prev, total: prev.total + 20 }));
      markHandled(pendingInvite?.code);
      setPendingInvite(null);
      onClose?.();
      showToast('🎉', t('inviteAccepted'));
      setTimeout(() => showToast('✦', '+20 EP'), 1500);
    } catch (e) {
      console.error('[invite] accept error:', e);
      showToast('⚠️', '초대 수락에 실패했어요');
    } finally {
      setAccepting(false);
    }
  };

  const decline = () => {
    markHandled(pendingInvite?.code);
    setPendingInvite(null);
    onClose?.();
    showToast('💌', t('inviteDeclined'));
  };

  const block = () => {
    markHandled(pendingInvite?.code);
    setPendingInvite(null);
    onClose?.();
    showToast('🚫', t('inviteBlocked'));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className={styles.avatar}
        style={{ background: emojiBg }}
      >
        {emoji}
      </div>
      <div className={styles.name}>{displayName}</div>
      <div className={styles.msg}>{t('inviterSampleMsg')}</div>

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.accept}`}
          onClick={accept}
          disabled={accepting}
        >
          {accepting ? '...' : t('acceptInviteBtn')}
        </button>
        <button className={`${styles.actionBtn} ${styles.decline}`} onClick={decline}>
          {t('declineInviteBtn')}
        </button>
      </div>
      <button className={`${styles.actionBtn} ${styles.block}`} onClick={block}>
        {t('blockInviteBtn')}
      </button>
    </Modal>
  );
}
