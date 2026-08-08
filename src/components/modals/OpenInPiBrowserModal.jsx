import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import { isAndroid, isIOS } from '../../utils/inAppBrowser';
import {
  openInPiBrowserAndroid, tryPiSchemeIOS, piBrowserStoreUrl,
} from '../../utils/piBrowserLink';
import styles from './OpenExternalModal.module.css';

// 초대 링크로 들어온 사람이 Pi Browser 밖에 있을 때 안내.
// Android는 버튼 1탭으로 자동 점프(설치 안 돼 있으면 지금 브라우저로 자연스럽게 폴백).
// iOS는 pi:// 스킴이 외부 URL을 받는 공식 규격이 확인되지 않아 최선 시도로만 제공하고,
// 스토어 링크와 "그냥 계속하기"를 항상 같이 보여준다.
export default function OpenInPiBrowserModal({ open, onClose, targetUrl }) {
  const { t } = useLang();
  const android = isAndroid();
  const ios = isIOS();

  const handleOpen = () => {
    if (android) {
      openInPiBrowserAndroid(targetUrl);
      return;
    }
    if (ios) {
      tryPiSchemeIOS(targetUrl);
    }
  };

  return (
    <Modal open={open} onClose={onClose} cardClassName={styles.card}>
      <div className={styles.icon}>🥧</div>
      <div className={styles.title}>{t('piGateTitle')}</div>
      <div className={styles.body}><p>{t('piGateBody')}</p></div>

      <button className={styles.primary} onClick={handleOpen}>
        {t('piGateOpenBtn')}
      </button>

      <a
        className={styles.secondary}
        href={piBrowserStoreUrl()}
        target="_blank"
        rel="noreferrer"
      >
        {t('piGateInstallLink')}
      </a>

      <button className={styles.secondary} onClick={onClose}>
        {t('piGateContinue')}
      </button>
    </Modal>
  );
}
