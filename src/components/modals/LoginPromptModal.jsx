import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import Modal from './Modal';
import styles from './LoginPromptModal.module.css';

// 소프트 게이트: 비로그인 사용자가 핵심 가치를 체험한 후 자연스럽게 로그인 유도.
// reason: 'share' | 'second' | 'streak' | 'push' — 컨텍스트별 메시지 분기
// onSkip: '나중에' 눌렀을 때 실행 (트리거에 따라 fallback 동작 다름)
export default function LoginPromptModal({ open, reason, onClose, onSkip, data }) {
  const { t } = useLang();
  const { signInWithKakao } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();

  const handleKakao = async () => {
    try {
      await signInWithKakao();
      // OAuth 리다이렉트 — 페이지 자체가 떠나므로 더 할 일 없음
    } catch {
      showToast('⚠️', t('loginFailed'));
    }
  };

  const handleLater = () => {
    onSkip?.();
    onClose?.();
  };

  const handleSignInPage = () => {
    onClose?.();
    navigate('/login');
  };

  // 컨텍스트별 메시지 + {n} 등 변수 치환
  const interp = (s) => {
    if (!data) return s;
    return Object.keys(data).reduce((acc, k) => acc.replaceAll(`{${k}}`, data[k]), s);
  };
  const title = interp(t(`loginPrompt_${reason}_title`));
  const sub = interp(t(`loginPrompt_${reason}_sub`));

  return (
    <Modal open={open} onClose={handleLater}>
      <div className={styles.body}>
        <div className={styles.icon}>🤝</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.sub}>{sub}</div>

        <button className={styles.kakaoBtn} onClick={handleKakao}>
          💬 {t('loginKakao')}
        </button>
        <button className={styles.signInLink} onClick={handleSignInPage}>
          {t('loginPrompt_moreOptions')}
        </button>
        <button className={styles.laterBtn} onClick={handleLater}>
          {t('loginPrompt_later')}
        </button>
      </div>
    </Modal>
  );
}
