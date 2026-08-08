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
  const { setUserEp, setPendingInvite, pendingInvite, bumpFriendsVersion } = useApp();
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
      showToast('🔑', t('inviteNeedLogin'));
      onClose?.();
      return;
    }
    // 실제 초대자 프로필 로딩 실패 (DB에 없는 코드)
    if (!inviter?.id || !pendingInvite?.code) {
      showToast('⚠️', t('inviteNotFound'));
      markHandled(pendingInvite?.code);
      setPendingInvite(null);
      onClose?.();
      return;
    }
    // 본인 초대 — 서버까지 갈 필요 없이 여기서 종결(재시도해도 절대 성공 못 함)
    if (inviter.id === user.id) {
      showToast('⚠️', t('inviteSelfError'));
      markHandled(pendingInvite.code);
      setPendingInvite(null);
      onClose?.();
      return;
    }

    setAccepting(true);
    try {
      // 실제 친구 관계 DB에 생성 (RLS에 따라 INSERT, 중복이면 alreadyFriends)
      await acceptInvite(user.id, pendingInvite.code);
      setUserEp((prev) => ({ ...prev, total: prev.total + 20 }));
      bumpFriendsVersion();
      markHandled(pendingInvite.code);
      setPendingInvite(null);
      onClose?.();
      showToast('🎉', t('inviteAccepted'));
      setTimeout(() => showToast('✦', '+20 EP'), 1500);
    } catch (e) {
      console.error('[invite] accept error:', e);
      // 실패해도 모달은 반드시 닫는다 — 닫히지 않는 팝업은 "앱이 멈췄다"로 읽힌다.
      // markHandled를 부르지 않으므로 보류 코드는 localStorage에 남고, 다음 접속 때
      // 모달이 다시 떠서 재시도할 수 있다.
      const selfInvite = /yourself/i.test(e?.message || '');
      if (selfInvite) markHandled(pendingInvite?.code); // 재시도 무의미 → 영구 정리
      setPendingInvite(null);
      onClose?.();
      showToast('⚠️', selfInvite ? t('inviteSelfError') : t('inviteAcceptFailed'));
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
