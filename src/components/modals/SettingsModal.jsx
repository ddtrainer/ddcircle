import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useLevel } from '../../context/LevelContext';
import { useApp } from '../../context/AppContext';
import { renderNickname } from '../../lib/nickname';
import Modal from './Modal';
import SetTimingModal from './SetTimingModal';
import PiTipModal from './PiTipModal';
import styles from './SettingsModal.module.css';

// 통합 설정 허브 — 언어(인라인) + 프로필·숨핏 타이밍·계정으로 연결.
// 기존에 흩어져 있던 진입점(헤더 KO/EN 토글, 아바타 메뉴, 타이밍 카드)을 여기로 일원화.
export default function SettingsModal({ open, onClose }) {
  const { lang, setLang } = useLang();
  const { user, profile, signOut } = useAuth();
  const { deepLevel } = useLevel();
  const { userEp } = useApp();
  const navigate = useNavigate();
  const [timingOpen, setTimingOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  const L = (ko, en) => (lang === 'ko' ? ko : en);

  const goProfile = () => {
    onClose?.();
    navigate(user ? '/profile-edit' : '/login');
  };

  const logout = async () => {
    const msg = L('로그아웃할까요?', 'Sign out of DDCircle?');
    if (!window.confirm(msg)) return;
    onClose?.();
    await signOut();
    navigate('/login', { replace: true });
  };

  const emoji = profile?.emoji || '🙂';

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className={styles.title}>{L('설정', 'Settings')}</div>

        {/* 언어 — 인라인 토글 */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>{L('언어', 'Language')}</div>
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'ko' ? styles.langActive : ''}`}
              onClick={() => setLang('ko')}
            >
              한국어
            </button>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>
        </div>

        {/* 프로필 */}
        <button className={styles.row} onClick={goProfile}>
          <span
            className={styles.rowIcon}
            style={profile?.avatar_url
              ? { padding: 0, overflow: 'hidden' }
              : { background: profile?.emoji_bg || 'var(--bg-soft)' }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className={styles.avatarImg} />
              : emoji}
          </span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{L('프로필', 'Profile')}</span>
            <span className={styles.rowSub}>
              {user
                ? (profile?.nickname
                    ? renderNickname(profile, { deepLevel, streak: userEp?.streak ?? 0 })
                    : L('프로필 편집', 'Edit profile'))
                : L('로그인 후 편집할 수 있어요', 'Sign in to edit')}
            </span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* 숨핏 타이밍 */}
        <button className={styles.row} onClick={() => setTimingOpen(true)}>
          <span className={styles.rowIcon}>⏰</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{L('숨핏 타이밍', 'Set timing')}</span>
            <span className={styles.rowSub}>{L('아침·저녁 알림 시간', 'Morning & evening reminders')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* Pi 후원(팁) */}
        <button className={styles.row} onClick={() => setTipOpen(true)}>
          <span className={styles.rowIcon}>💜</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{L('Pi로 후원하기', 'Support with Pi')}</span>
            <span className={styles.rowSub}>{L('원하는 만큼 Pi로 응원', 'Send any amount in Pi')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* 계정 */}
        {user ? (
          <button className={`${styles.row} ${styles.danger}`} onClick={logout}>
            <span className={styles.rowIcon}>↩️</span>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{L('로그아웃', 'Sign out')}</span>
            </span>
          </button>
        ) : (
          <button className={styles.row} onClick={() => { onClose?.(); navigate('/login'); }}>
            <span className={styles.rowIcon}>🔑</span>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{L('로그인', 'Sign in')}</span>
            </span>
          </button>
        )}
      </Modal>

      {/* 숨핏 타이밍은 기존 모달 그대로 재사용 (설정 위에 겹쳐 열림) */}
      <SetTimingModal open={timingOpen} onClose={() => setTimingOpen(false)} />
      {/* Pi 후원(팁) 모달 */}
      <PiTipModal open={tipOpen} onClose={() => setTipOpen(false)} />
    </>
  );
}
