import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import styles from './Login.module.css';

export default function Login() {
  const { t } = useLang();
  const { signInWithKakao, user, loading: authLoading } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 유저는 프로필 설정 여부에 따라 분기
  useEffect(() => {
    if (authLoading || !user) return;
    const setupDone = localStorage.getItem(`ddcircle.setup.${user.id}`);
    navigate(setupDone ? '/' : '/profile-setup', { replace: true });
  }, [user, authLoading, navigate]);

  const handleKakao = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithKakao();
    } catch (e) {
      showToast('⚠️', t('loginFailed'));
      setLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <div className={styles.logo}>
          <img src="/dd-logo.png" alt="DDCircle" width={80} height={80} />
        </div>
        <div className={styles.title}>{t('loginTitle')}</div>
        <div className={styles.sub}>{t('loginSub')}</div>
      </div>

      <button
        className={styles.kakaoBtn}
        onClick={handleKakao}
        disabled={loading}
      >
        <span className={styles.kakaoIcon}>💬</span>
        {loading ? t('loggingIn') : t('loginKakao')}
      </button>

      <div className={styles.notice}>{t('loginNotice')}</div>
    </div>
  );
}
