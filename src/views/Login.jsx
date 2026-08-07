import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

// Pi 전용 — 카카오/구글 OAuth 로그인 제거. 이 화면은 Pi Browser의 Pi 로그인 안내만 표시.
export default function Login() {
  const { lang, t } = useLang();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 유저는 프로필 설정 여부에 따라 분기
  useEffect(() => {
    if (authLoading || !user) return;
    const setupDone = localStorage.getItem(`ddcircle.setup.${user.id}`);
    navigate(setupDone ? '/' : '/profile-setup', { replace: true });
  }, [user, authLoading, navigate]);

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <div className={styles.logo}>
          <img src="/dd-logo-192.png" alt="DDCircle" width={80} height={80} />
        </div>
        <div className={styles.title}>DDCircle</div>
        <div className={styles.sub}>
          {t('loginPiSub')}
        </div>
      </div>

      <div className={styles.notice}>
        {t('loginPiNotice')}
      </div>

      <button className={styles.homeBtn} onClick={() => navigate('/', { replace: true })}>
        {t('goHome')}
      </button>

      <div className={styles.legalNotice}>
        <Link to="/terms" className={styles.legalLink}>{t('termsLink')}</Link>
        {' · '}
        <Link to="/privacy" className={styles.legalLink}>{t('privacyLink')}</Link>
      </div>
    </div>
  );
}
