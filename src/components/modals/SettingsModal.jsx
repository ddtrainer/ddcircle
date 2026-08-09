import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getLocale } from '../../i18n/locales';
import { useAuth } from '../../context/AuthContext';
import { useLevel } from '../../context/LevelContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import { renderNickname } from '../../lib/nickname';
import Modal from './Modal';
import SetTimingModal from './SetTimingModal';
import PiTipModal from './PiTipModal';
import LanguageModal from './LanguageModal';
import HelpFeedbackModal from './HelpFeedbackModal';
import AboutModal from './AboutModal';
import styles from './SettingsModal.module.css';

// 통합 설정 허브 — 언어(인라인) + 프로필·DD 타이밍·계정으로 연결.
// 기존에 흩어져 있던 진입점(헤더 KO/EN 토글, 아바타 메뉴, 타이밍 카드)을 여기로 일원화.
export default function SettingsModal({ open, onClose }) {
  const { lang, t } = useLang();
  const { user, profile, signOut } = useAuth();
  const { deepLevel } = useLevel();
  const { userEp } = useApp();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [timingOpen, setTimingOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // 디지털북(PDF) — 아직 실제 상품이 아니라 준비 중 안내만. 구매 플로우 없이 토스트로 끝.
  const openDigitalBookInfo = () => {
    showToast('📖', t('digitalBookComingSoonToast'));
  };


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

        {/* DDCircle 소개 */}
        <button className={styles.row} onClick={() => setAboutOpen(true)}>
          <span className={styles.rowIcon}>📄</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('aboutRowTitle')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* 언어 — 15개 지원. 별도 리스트 화면(LanguageModal)에서 선택. */}
        <button className={styles.row} onClick={() => setLangOpen(true)}>
          <span className={styles.rowIcon}>🌐</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('languageLabel')}</span>
          </span>
          <span className={styles.rowValue}>{getLocale(lang).label}</span>
          <span className={styles.chevron}>›</span>
        </button>

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

        {/* 디지털북(PDF) — 판매 상품 준비 중 안내. 실제 구매 플로우는 아직 없음(토스트로만 안내) */}
        <button className={styles.row} onClick={openDigitalBookInfo}>
          <span className={styles.rowIcon}>📖</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('digitalBookRowTitle')}</span>
            <span className={styles.rowSub}>{t('digitalBookRowSub')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* 이용약관 / 개인정보처리방침 — 기존엔 로그인 화면 하단에만 있어 로그인 후엔 찾을 방법이 없었음 */}
        <button className={styles.row} onClick={() => { onClose?.(); navigate('/terms'); }}>
          <span className={styles.rowIcon}>📜</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('termsLink')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>
        <button className={styles.row} onClick={() => { onClose?.(); navigate('/privacy'); }}>
          <span className={styles.rowIcon}>🔒</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('privacyLink')}</span>
          </span>
          <span className={styles.chevron}>›</span>
        </button>

        {/* 도움말 및 피드백 — 문의 메일 + 알아두면 좋은 사항 안내 */}
        <button className={styles.row} onClick={() => setHelpOpen(true)}>
          <span className={styles.rowIcon}>💬</span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>{t('helpFeedbackRowTitle')}</span>
            <span className={styles.rowSub}>{t('helpFeedbackRowSub')}</span>
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
      {/* 언어 선택 화면 */}
      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
      {/* 도움말 및 피드백 */}
      <HelpFeedbackModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      {/* DDCircle 소개 */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
