import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { lang, setLang } = useLang();
  const { user, profile, signOut } = useAuth();
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
        <div className={styles.logoWrap}>
          <svg className={styles.logo} viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" aria-label="DDCircle">
            <defs>
              {/* Deep-first 리브랜드: 왼쪽 D는 Deep(녹→청), 오른쪽 D는 Dash(빨→주황) */}
              <linearGradient id="leftD" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7ed957" />
                <stop offset="50%" stopColor="#3bbfb0" />
                <stop offset="100%" stopColor="#1e9bd8" />
              </linearGradient>
              <linearGradient id="rightD" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ed3a4a" />
                <stop offset="50%" stopColor="#f47730" />
                <stop offset="100%" stopColor="#fbb040" />
              </linearGradient>
            </defs>
            <path d="M 30 20 L 100 20 Q 180 20 180 100 Q 180 180 100 180 L 30 180 Z M 70 60 L 70 140 L 100 140 Q 140 140 140 100 Q 140 60 100 60 Z" fill="url(#leftD)" fillRule="evenodd" />
            <path d="M 220 20 L 290 20 Q 370 20 370 100 Q 370 180 290 180 L 220 180 Z M 260 60 L 260 140 L 290 140 Q 330 140 330 100 Q 330 60 290 60 Z" fill="url(#rightD)" fillRule="evenodd" />
          </svg>
          <span className={styles.label}>CIRCLE</span>
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
                style={{ background: profile?.emoji_bg || 'linear-gradient(135deg,#fde2e4,#fad2e1)' }}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="user menu"
                aria-expanded={menuOpen}
              >
                {profile?.emoji || '🌸'}
              </button>
              {menuOpen && (
                <div className={styles.menu} role="menu">
                  {profile?.nickname && (
                    <div className={styles.menuHeader}>{profile.nickname}</div>
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
