import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import Modal from './Modal';
import styles from './IncomingInviteModal.module.css';

// 받은 초대 모달 — pendingInvite가 있을 때만 열림
// 데모 데이터: 초대자는 "서울의 지수" 가상 사용자
const DEMO_INVITER = {
  name: '서울의 지수',
  enName: 'Jisu in Seoul',
  emoji: '🌸',
  color: '#fbb040,#f97b9c',
  streak: 23,
  friendCount: 7,
  daysActive: 142,
};

export default function IncomingInviteModal({ open, onClose }) {
  const { t, lang } = useLang();
  const { setUserEp, setPendingInvite } = useApp();
  const { show: showToast } = useToast();

  const inviter = DEMO_INVITER;
  const displayName = lang === 'ko' ? inviter.name : inviter.enName;

  const accept = () => {
    // 친구 추가 시뮬레이션 + +20 EP 보너스
    setUserEp((prev) => ({ ...prev, total: prev.total + 20 }));
    setPendingInvite(null);
    onClose?.();
    showToast('🎉', t('inviteAccepted'));
    setTimeout(() => showToast('✦', '+20 EP'), 1500);
  };

  const decline = () => {
    setPendingInvite(null);
    onClose?.();
    showToast('💌', t('inviteDeclined'));
  };

  const block = () => {
    setPendingInvite(null);
    onClose?.();
    showToast('🚫', t('inviteBlocked'));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className={styles.avatar}
        style={{ background: `linear-gradient(135deg,${inviter.color})` }}
      >
        {inviter.emoji}
      </div>
      <div className={styles.name}>{displayName}</div>
      <div className={styles.msg}>{t('inviterSampleMsg')}</div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.num}>🔥 {inviter.streak}</span>
          {t('inviterStreakLabel')}
        </div>
        <div className={styles.stat}>
          <span className={styles.num}>💙 {inviter.friendCount}</span>
          {t('inviterFriendsLabel')}
        </div>
        <div className={styles.stat}>
          <span className={styles.num}>📅 {inviter.daysActive}</span>
          {t('inviterDayLabel')}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${styles.accept}`} onClick={accept}>
          {t('acceptInviteBtn')}
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
