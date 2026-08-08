import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { LOCALES } from '../../i18n/locales';
import { useAuth } from '../../context/AuthContext';
import { useLevel } from '../../context/LevelContext';
import { useApp } from '../../context/AppContext';
import { renderNickname } from '../../lib/nickname';
import Modal from './Modal';
import SetTimingModal from './SetTimingModal';
import PiTipModal from './PiTipModal';
import styles from './SettingsModal.module.css';

// 통합 설정 허브 — 언어(인라인) + 프로필·DD 타이밍·계정으로 연결.
// 기존에 흩어져 있던 진입점(헤더 KO/EN 토글, 아바타 메뉴, 타이밍 카드)을 여기로 일원화.
export default function SettingsModal({ open, onClose }) {
  const { lang, setLang, t } = useLang();
  const { user, profile, signOut } = useAuth();
  const { deepLevel } = useLevel();
  const { userEp } = useApp();
  const navigate = useNavigate();
  const [timingOpen, setTimingOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);


  const goProfile = () => {
    // Pi 전용 — 카카오/구글 로그인 진입점 제거. 계정이 있을 때만 편집으로 이동.
    if (!user) return;
    onClose?.();
    navigate('/profile-edit');
  };

  const logout = async () => {
    const msg = t('signOutConfirm');
    if (!window.confirm(msg)) return;
    onClose?.();
    await signOut();
    navigate('/', { replace: true });
  };

  const emoji = profile?.emoji || '🙂';

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className={styles.title}>{t('settingsTitle')}</div>

        {/* 언어 — 15개 지원. 각 언어를 그 언어 사용자가 읽을 수 있도록 원어로 표기한다. */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>{t('languageLabel')}</div>
          <div className={styles.langGrid}>
            {LOCALES.map((l) => (
              <button
                key={l.code}
                className={`${styles.langBtn} ${lang === l.code ? styles.langActive : ''}`}
                onClick={() => setLang(l.code)}
                lang={l.code}
                dir={l.dir}
              >
                {l.label}
              </button>
            ))}
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
            <span className={styles.rowTitle}>{t('profileLabel')}</span>
            <span className={styles.rowSub}>
              {user
                ? (profile?.nickname
                    ? renderNickname(profile, { deepLevel, streak: userEp?.streak ?? 0 })
                    : t('profileEdit'))
                : t('profileSignInToEdit')}
            </span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* DD 타이밍 */}
        <button className={styles.row} onClick={() => setTimingOpen(true)}>
          <span className={styles.rowIcon}>⏰</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('timingLabel')}</span>
            <span className={styles.rowSub}>{t('timingSub')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* Pi 후원(팁) */}
        <button className={styles.row} onClick={() => setTipOpen(true)}>
          <span className={styles.rowIcon}>💜</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('tipRowTitle')}</span>
            <span className={styles.rowSub}>{t('tipRowSub')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* 계정 — Pi 전용. 기존 계정 세션이 있을 때만 로그아웃 노출(카카오/구글 로그인 진입점 제거) */}
        {user && (
          <button className={`${styles.row} ${styles.danger}`} onClick={logout}>
            <span className={styles.rowIcon}>↩️</span>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{t('signOut')}</span>
            </span>
          </button>
        )}
      </Modal>

      {/* DD 타이밍은 기존 모달 그대로 재사용 (설정 위에 겹쳐 열림) */}
      <SetTimingModal open={timingOpen} onClose={() => setTimingOpen(false)} />
      {/* Pi 후원(팁) 모달 */}
      <PiTipModal open={tipOpen} onClose={() => setTipOpen(false)} />
    </>
  );
}
