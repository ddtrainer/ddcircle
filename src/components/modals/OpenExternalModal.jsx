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
  const { lang } = useLang();
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

  const title = lang === 'en'
    ? (reason === 'share' ? 'Open in your browser to share' : 'Open in your browser')
    : (reason === 'share' ? '외부 브라우저로 열어 공유해요' : '더 편하게 쓰려면 외부 브라우저로 열어요');

  const body = lang === 'en' ? (
    <>
      <p>
        {`This page is open in ${label === '인앱 브라우저' ? 'an in-app browser' : label}, which blocks card sharing and home-screen install.`}
      </p>
      <p>Tap below to open in Chrome/Safari — sharing and installing then work normally.</p>
    </>
  ) : (
    <>
      <p>
        지금 <b>{label}</b> 안에서 보고 있어요. 인앱 브라우저는 카드 공유와 홈 화면 추가가 막혀 있어요.
      </p>
      <p>아래 버튼을 누르면 <b>Chrome/Safari</b>로 열려서 공유·설치가 정상 작동해요.</p>
    </>
  );

  const iosInstructions = lang === 'en' ? (
    <ol className={styles.steps}>
      <li>Tap the <b>⋯</b> menu at the top-right</li>
      <li>Choose <b>"Open in Safari"</b> (or default browser)</li>
    </ol>
  ) : (
    <ol className={styles.steps}>
      <li>오른쪽 위 <b>⋯</b> 또는 <b>⋮</b> 메뉴를 눌러요</li>
      <li><b>"다른 브라우저로 열기"</b> 또는 <b>"Safari로 열기"</b>를 선택해요</li>
    </ol>
  );

  return (
    <Modal open={open} onClose={onClose} cardClassName={styles.card}>
      <div className={styles.icon}>🌐</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>

      {canAutoJump && (
        <button className={styles.primary} onClick={handleOpen}>
          {lang === 'en' ? 'Open in Chrome' : 'Chrome으로 열기'}
        </button>
      )}

      {ios && iosInstructions}

      {!canAutoJump && !ios && (
        <button className={styles.primary} onClick={handleOpen}>
          {lang === 'en' ? 'Open in browser' : '브라우저로 열기'}
        </button>
      )}

      <button className={styles.secondary} onClick={onClose}>
        {reason === 'share'
          ? (lang === 'en' ? 'Not now' : '나중에')
          : (lang === 'en' ? 'Continue here' : '여기서 계속 보기')}
      </button>
    </Modal>
  );
}
