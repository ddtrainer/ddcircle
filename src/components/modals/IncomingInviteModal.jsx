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
        const trimmed = handled.slice(-50);
        localStorage.setItem('ddcircle.handledInvites', JSON.stringify(trimmed));
      }
      // 보류 코드도 정리
      localStorage.removeItem('ddcircle.pendingInviteCode');
    } catch { /* ignore */ }
  };

  const accept = async () => {
    if (accepting) return;

    // 비로그인 상태에선 친구 관계 생성 불가 — 로그인 안내만
    if (!user) {
      showToast('🔑', '로그인하면 친구로 등록할 수 있어요');
      onClose?.();
      return;
    }
    // 실제 초대자 프로필 로딩 실패 (DB에 없는 코드)
    if (!inviter?.id || !pendingInvite?.code) {
      showToast('⚠️', '초대 정보를 찾을 수 없어요');
      markHandled(pendingInvite?.code);
      setPendingInvite(null);
      onClose?.();
      return;
    }

    setAccepting(true);
    try {
      // 실제 친구 관계 DB에 생성 (RLS에 따라 INSERT, 중복이면 alreadyFriends)
      await acceptInvite(user.id, pendingInvite.code);
      setUserEp((prev) => ({ ...prev, total: prev.total + 20 }));
      markHandled(pendingInvite.code);
      setPendingInvite(null);
      onClose?.();
      showToast('🎉', t('inviteAccepted'));
      setTimeout(() => showToast('✦', '+20 EP'), 1500);
    } catch (e) {
      console.error('[invite] accept error:', e);
      showToast('⚠️', `초대 수락 실패: ${e?.message || '잠시 후 다시 시도해주세요'}`);
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
