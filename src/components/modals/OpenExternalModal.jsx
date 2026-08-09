import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import {
  isInAppBrowser, isAndroid, isIOS, inAppBrand, brandLabel, openInExternalBrowser,
} from '../../utils/inAppBrowser';
import styles from './OpenExternalModal.module.css';

// 인앱 브라우저(카톡·네이버·페북 등)에서 진입한 사용자에게
// "외부 브라우저로 열기" 1탭 점프를 제공. Android는 URL scheme/intent로 자동 점프,
// iOS는 OS 제약상 수동 안내 (스크린샷 없이 텍스트로 ⋮ → Safari 위치 설명).
//
// reason: 'share' — 공유 버튼 누른 직후 띄움 (강한 안내)
//          'banner' — 앱 진입 시 한 번 띄움 (부드러운 안내, 나중에 닫기 가능)
export default function OpenExternalModal({ open, onClose, reason = 'banner' }) {
  const { t } = useLang();
  const brand = inAppBrand();
  const label = brandLabel(brand);
  const ios = isIOS();
  const android = isAndroid();

  const handleOpen = () => {
    const r = openInExternalBrowser();
    if (r === 'opened') onClose?.();
  };

  // 점프 가능한 환경(Android)인지
  const canAutoJump = android && isInAppBrowser();

  const title = t(reason === 'share' ? 'extBrowserTitleShare' : 'extBrowserTitleBanner');

  const body = (
    <>
      <p>{t('extBrowserBody1', { brand: label })}</p>
      <p>{t('extBrowserBody2')}</p>
    </>
  );

  const iosInstructions = (
    <ol className={styles.steps}>
      <li>{t('extBrowserIosStep1')}</li>
      <li>{t('extBrowserIosStep2')}</li>
    </ol>
  );

  return (
    <Modal open={open} onClose={onClose} cardClassName={styles.card}>
      <div className={styles.icon}>🌐</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>

      {canAutoJump && (
        <button className={styles.primary} onClick={handleOpen}>
          {t('extBrowserOpenChrome')}
        </button>
      )}

      {ios && iosInstructions}

      {!canAutoJump && !ios && (
        <button className={styles.primary} onClick={handleOpen}>
          {t('extBrowserOpenGeneric')}
        </button>
      )}

      <button className={styles.secondary} onClick={onClose}>
        {t(reason === 'share' ? 'extBrowserNotNow' : 'extBrowserContinueHere')}
      </button>
    </Modal>
  );
}
