import { useEffect, useRef, useState } from 'react';
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
//
// intent:// / pi:// 자동 점프는 텔레그램 등 일부 인앱 브라우저(webview)에서 조용히
// 무시되는 경우가 있다(intent 문법 자체를 해석 못 함) — Pi Network 공식 문서에도
// "Pi Browser로의 자동 전환"은 보장되지 않고 사용자가 직접 전환하는 게 기본 플로우로
// 안내돼 있다. 그래서 버튼을 누른 뒤 페이지가 실제로 백그라운드로 전환되는지
// (document.hidden)를 짧게 지켜보고, 안 됐으면 "링크 복사 → Pi Browser에 붙여넣기"
// 수동 대안을 같은 화면에 바로 보여준다.
export default function OpenInPiBrowserModal({ open, onClose, targetUrl }) {
  const { t } = useLang();
  const android = isAndroid();
  const ios = isIOS();
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const visHandlerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setShowFallback(false);
      setCopied(false);
      clearTimeout(timerRef.current);
      if (visHandlerRef.current) document.removeEventListener('visibilitychange', visHandlerRef.current);
    }
  }, [open]);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    if (visHandlerRef.current) document.removeEventListener('visibilitychange', visHandlerRef.current);
  }, []);

  const armFallbackCheck = () => {
    clearTimeout(timerRef.current);
    if (visHandlerRef.current) document.removeEventListener('visibilitychange', visHandlerRef.current);

    const onVisibility = () => {
      if (document.hidden) {
        clearTimeout(timerRef.current);
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
    visHandlerRef.current = onVisibility;
    document.addEventListener('visibilitychange', onVisibility);

    timerRef.current = setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      setShowFallback(true);
    }, 1500);
  };

  const handleOpen = () => {
    if (android) {
      openInPiBrowserAndroid(targetUrl);
      armFallbackCheck();
      return;
    }
    if (ios) {
      tryPiSchemeIOS(targetUrl);
      armFallbackCheck();
    }
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = targetUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <Modal open={open} onClose={onClose} cardClassName={styles.card}>
      <div className={styles.icon}>🥧</div>
      <div className={styles.title}>{t('piGateTitle')}</div>
      <div className={styles.body}><p>{t('piGateBody')}</p></div>

      <button className={styles.primary} onClick={handleOpen}>
        {t('piGateOpenBtn')}
      </button>

      {showFallback && (
        <div className={styles.fallback}>
          <p className={styles.fallbackTitle}>{t('piGateFallbackTitle')}</p>
          <ol className={styles.fallbackSteps}>
            <li>{t('piGateFallbackStep1')}</li>
            <li>{t('piGateFallbackStep2')}</li>
          </ol>
          <button className={styles.fallbackCopyBtn} onClick={copyLink}>
            {copied ? t('piGateLinkCopied') : t('piGateCopyLink')}
          </button>
        </div>
      )}

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
