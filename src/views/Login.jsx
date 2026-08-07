import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

// Pi 전용 — 카카오/구글 OAuth 로그인 제거. 이 화면은 Pi Browser의 Pi 로그인 안내만 표시.
export default function Login() {
  const { lang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const L = (ko, en) => (lang === 'ko' ? ko : en);

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
          {L('DDCircle은 Pi Browser에서 Pi 계정으로 이용해요.',
             'DDCircle runs on Pi — sign in with your Pi account in the Pi Browser.')}
        </div>
      </div>

      <div className={styles.notice}>
        {L('상단의 "Pi로 로그인" 버튼으로 로그인할 수 있어요. Pi Browser에서 열면 자동으로 로그인이 진행됩니다.',
           'Use the “Sign in with Pi” button at the top. When opened in the Pi Browser, sign-in starts automatically.')}
      </div>

      <button className={styles.homeBtn} onClick={() => navigate('/', { replace: true })}>
        {L('홈으로', 'Go home')}
      </button>

      <div className={styles.legalNotice}>
        <Link to="/terms" className={styles.legalLink}>{L('이용약관', 'Terms')}</Link>
        {' · '}
        <Link to="/privacy" className={styles.legalLink}>{L('개인정보처리방침', 'Privacy')}</Link>
      </div>
    </div>
  );
}
