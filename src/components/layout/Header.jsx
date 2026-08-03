import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useLevel } from '../../context/LevelContext';
import { useApp } from '../../context/AppContext';
import { renderNickname } from '../../lib/nickname';
import styles from './Header.module.css';

export default function Header() {
  const { lang, setLang } = useLang();
  const { user, profile, signOut } = useAuth();
  const { deepLevel } = useLevel();
  const { userEp } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const handleEdit = () => {
    setMenuOpen(false);
    navigate('/profile-edit');
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    const msg = lang === 'ko' ? '로그아웃할까요?' : 'Sign out of DDCircle?';
    if (!window.confirm(msg)) return;
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logoWrap} aria-label="숨-핏 By DDCircle">
          {/* 숨-핏 워드마크 — 무지개 그라데이션(브랜드 컬러) + 한 줄 태그라인, 아래 By DDCircle */}
          <div className={styles.brandTop}>
            <span className={styles.brandMark}>{lang === 'ko' ? '숨-핏' : 'Soom-Fit'}</span>
            <span className={styles.brandTag}>{lang === 'ko' ? '숨 쉬고 운동해' : 'Breathe & Move'}</span>
          </div>
          <span className={styles.brandBy}>By DDCircle</span>
        </div>

        <div className={styles.right}>
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'ko' ? styles.active : ''}`}
              onClick={() => setLang('ko')}
            >
              KO
            </button>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.active : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>

          {!user && (
            <button
              className={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              {lang === 'ko' ? '로그인' : 'Sign in'}
            </button>
          )}

          {user && (
            <div className={styles.menuWrap} ref={menuRef}>
              <button
                className={styles.avatarBtn}
                style={profile?.avatar_url
                  ? { padding: 0, overflow: 'hidden' }
                  : { background: profile?.emoji_bg || 'linear-gradient(135deg,#fde2e4,#fad2e1)' }
                }
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="user menu"
                aria-expanded={menuOpen}
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
              {menuOpen && (
                <div className={styles.menu} role="menu">
                  {profile?.nickname && (
                    <div className={styles.menuHeader}>
                      {renderNickname(profile, { deepLevel, streak: userEp?.streak ?? 0 })}
                    </div>
                  )}
                  <button className={styles.menuItem} onClick={handleEdit} role="menuitem">
                    {lang === 'ko' ? '프로필 편집' : 'Edit profile'}
                  </button>
                  <button
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    {lang === 'ko' ? '로그아웃' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
