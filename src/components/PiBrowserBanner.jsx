import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { isPiBrowser } from '../lib/piAuth';
import { piNetHref } from '../config/piNet';
import { openInPiBrowserAndroid, tryPiSchemeIOS, piBrowserStoreUrl } from '../utils/piBrowserLink';
import { isIOS } from '../utils/inAppBrowser';
import styles from './PiBrowserBanner.module.css';

// Pi Browser 밖에서 앱을 보고 있을 때 상단에 뜨는 안내 배너.
//
// 이전에는 초대 링크(?invite=)로 들어온 경우에만 모달을 띄웠는데, 그러면 카카오톡·
// 텔레그램에서 그냥 링크를 눌러 들어온 대다수에게는 아무것도 안 보이고, Pi 로그인이
// 안 되는 이유도 알 수 없었다. 이제 Pi Browser가 아니면 항상 배너를 보여준다.
//
// 화면을 막지 않으므로 "그냥 여기서 계속"을 고른 사람은 그대로 둘러볼 수 있다.
const DISMISS_KEY = 'ddcircle.piBanner.dismissed';

export default function PiBrowserBanner() {
  const { t } = useLang();
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (isPiBrowser()) return true; // 이미 Pi Browser — 배너 자체가 불필요
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const visRef = useRef(null);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    if (visRef.current) document.removeEventListener('visibilitychange', visRef.current);
  }, []);

  if (hidden) return null;

  const target = piNetHref();

  // 앱 전환이 실제로 일어났는지 확인 — 화면이 백그라운드로 내려가면 성공.
  // 1.6초 안에 아무 일도 없으면 수동 안내(주소 복사)를 펼친다.
  const watchForSwitch = () => {
    clearTimeout(timerRef.current);
    if (visRef.current) document.removeEventListener('visibilitychange', visRef.current);
    const onVis = () => {
      if (document.hidden) {
        clearTimeout(timerRef.current);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
    visRef.current = onVis;
    document.addEventListener('visibilitychange', onVis);
    timerRef.current = setTimeout(() => {
      document.removeEventListener('visibilitychange', onVis);
      setShowFallback(true);
    }, 1600);
  };

  const openInPi = () => {
    // 반드시 클릭과 같은 틱에 — await를 끼우면 제스처가 풀려 전환이 막힌다
    if (isIOS()) tryPiSchemeIOS(target);
    else openInPiBrowserAndroid(target);
    watchForSwitch();
  };

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setHidden(true);
  };

  const copyAddress = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className={styles.banner}>
      <p className={styles.body}>{t('piBannerBody')}</p>

      <button className={styles.open} onClick={openInPi}>
        📲 {t('piGateOpenBtn')}
      </button>

      <button className={styles.stay} onClick={dismiss}>
        {t('piBannerStay')}
      </button>

      {showFallback && (
        <div className={styles.fallback}>
          <div>{t('piGateFallbackTitle')}</div>
          <div>1. {t('piGateFallbackStep1')}</div>
          <div>2. {t('piGateFallbackStep2')}</div>
          <button className={styles.copyBtn} onClick={copyAddress}>
            {copied ? t('piGateLinkCopied') : t('piGateCopyLink')}
          </button>
          <a
            className={styles.stay}
            href={piBrowserStoreUrl()}
            target="_blank"
            rel="noreferrer"
          >
            {t('piGateInstallLink')}
          </a>
        </div>
      )}
    </div>
  );
}
