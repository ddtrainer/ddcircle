import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import SettingsModal from '../modals/SettingsModal';
import styles from './Header.module.css';

export default function Header() {
  const { lang } = useLang();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
    <header className={styles.header}>
      <div className={styles.inner}>
        <div
          className={styles.logoWrap}
          role="button"
          tabIndex={0}
          aria-label={lang === 'ko' ? '숨-핏 홈으로' : 'Soom-Fit home'}
          onClick={() => navigate('/')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/'); } }}
        >
          {/* 숨-핏 워드마크 — 무지개 그라데이션(브랜드 컬러) + 한 줄 태그라인, 아래 By DDCircle. 탭하면 홈으로 */}
          <div className={styles.brandTop}>
            <span className={styles.brandMark}>{lang === 'ko' ? '숨-핏' : 'Soom-Fit'}</span>
            <span className={styles.brandTag}>{lang === 'ko' ? '숨 쉬고 운동해' : 'Breathe & Move'}</span>
          </div>
          <span className={styles.brandBy}>By DDCircle</span>
        </div>

        <div className={styles.right}>
          {!user && (
            <button
              className={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              {lang === 'ko' ? '로그인' : 'Sign in'}
            </button>
          )}

          {/* 통합 설정 진입 — 로그인 시 아바타, 비로그인 시 ⚙️ (언어·프로필·타이밍·계정 일원화) */}
          {user ? (
            <button
              className={styles.avatarBtn}
              style={profile?.avatar_url
                ? { padding: 0, overflow: 'hidden' }
                : { background: profile?.emoji_bg || 'linear-gradient(135deg,#fde2e4,#fad2e1)' }}
              onClick={() => setSettingsOpen(true)}
              aria-label={lang === 'ko' ? '설정' : 'Settings'}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                profile?.emoji || '🌸'
              )}
            </button>
          ) : (
            <button
              className={styles.settingsBtn}
              onClick={() => setSettingsOpen(true)}
              aria-label={lang === 'ko' ? '설정' : 'Settings'}
            >
              ⚙️
            </button>
          )}
        </div>
      </div>
    </header>

    {/* backdrop-filter가 있는 header 밖에서 렌더 — position:fixed 오버레이가 뷰포트 기준으로 뜨도록 */}
    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
