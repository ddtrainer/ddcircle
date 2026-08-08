import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import { FRIENDS } from '../../data/friends';
import Modal from './Modal';
import { track, Events } from '../../utils/analytics';
import styles from './InviteModal.module.css';

const MAX_CIRCLE = 12;

export default function InviteModal({ open, onClose }) {
  const { t } = useLang();
  const { inviteLink } = useApp();
  const { show: showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        // 폴백: textarea
        const ta = document.createElement('textarea');
        ta.value = inviteLink;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      showToast('✓', t('linkCopiedToast'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('⚠️', t('linkCopiedToast'));
    }
  };

  // 공유 — 기기 기본 공유 시트(navigator.share)를 연다. 국가마다 깔린 메신저가
  // 다르므로(WhatsApp/Telegram/카카오톡/Messages 등) 특정 앱을 하드코딩하지 않고
  // OS가 알아서 목록을 보여주게 둔다. 데스크톱처럼 Web Share 미지원 환경은
  // 링크를 자동 복사해서 안내.
  const share = async () => {
    track(Events.INVITE_SENT, { channel: navigator.share ? 'webshare' : 'copy' });
    const text = t('inviteShareText');
    const title = t('inviteShareTitle');

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: inviteLink });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; // 사용자 취소
      }
    }
    copyLink();
  };

  // navigator.share가 없는 환경(Pi Browser 등 인앱 브라우저)을 위한 개별 채널 버튼.
  // wa.me / t.me는 앱 미설치 시 자동으로 웹 버전으로 열리므로 국가별 분기 불필요.
  // 주의: Pi Browser는 앱을 cross-origin iframe으로 감싸는데, location.href로 이동시키면
  // 최상위 창이 아니라 그 iframe 자체를 이동시키려다 wa.me/t.me의 프레임 차단 헤더에
  // 걸려 net::ERR_BLOCKED_BY_RESPONSE가 난다 — window.open(_blank)로 새 창/탭에서 열어야 한다.
  // 그마저 팝업이 막힌 샌드박스라면(window.open이 null 반환) 최상위 프레임 자체를
  // 이동시키는 것으로 한 번 더 시도한다 — 미니앱을 벗어나긴 하지만 공유는 완료된다.
  const openExternal = (url) => {
    const win = window.open(url, '_blank');
    if (!win) {
      try {
        window.top.location.href = url;
      } catch {
        window.location.href = url;
      }
    }
  };

  const shareWhatsApp = () => {
    track(Events.INVITE_SENT, { channel: 'whatsapp' });
    showToast('💚', t('whatsappOpening'));
    const text = encodeURIComponent(`${t('inviteShareText')} ${inviteLink}`);
    openExternal(`https://wa.me/?text=${text}`);
  };

  const shareTelegram = () => {
    track(Events.INVITE_SENT, { channel: 'telegram' });
    showToast('✈️', t('telegramOpening'));
    const url = encodeURIComponent(inviteLink);
    const text = encodeURIComponent(t('inviteShareText'));
    openExternal(`https://t.me/share/url?url=${url}&text=${text}`);
  };

  const shareSMS = () => {
    track(Events.INVITE_SENT, { channel: 'sms' });
    showToast('💬', t('smsOpening'));
    const body = encodeURIComponent(`${t('inviteShareText')} ${inviteLink}`);
    window.location.href = `sms:?body=${body}`;
  };

  const shareEmail = () => {
    track(Events.INVITE_SENT, { channel: 'email' });
    showToast('📧', t('emailOpening'));
    const subject = encodeURIComponent(t('inviteShareTitle'));
    const body = encodeURIComponent(`${t('inviteShareText')}\n\n${inviteLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Modal open={open} onClose={onClose} cardClassName={styles.inviteCard}>
      <div className={styles.title}>{t('inviteModalTitle')}</div>
      <div className={styles.sub}>{t('inviteModalSub')}</div>

      {/* 인원 표시 */}
      <div className={styles.summary}>
        <span>{t('inviteSummaryLabel')}</span>
        <span className={styles.count}>
          {FRIENDS.length}/{MAX_CIRCLE}
        </span>
      </div>

      {/* 초대 링크 + 복사 */}
      <div className={styles.linkBox}>
        <div className={styles.linkText}>{inviteLink}</div>
        <button
          className={`${styles.linkCopy} ${copied ? styles.copied : ''}`}
          onClick={copyLink}
        >
          {copied ? t('inviteCopiedLabel') : t('inviteCopyLabel')}
        </button>
      </div>

      {/* 공유 — 기기 기본 공유 시트 */}
      <button className={styles.shareBtn} onClick={share}>
        <span className={styles.shareIcon}>📤</span>
        {t('shareLabel')}
      </button>

      {/* WhatsApp / Telegram / SMS / 이메일 / QR — navigator.share 미지원 환경(Pi Browser 등)에서도
          바로 쓸 수 있는 개별 채널 버튼 */}
      <div className={styles.secondaryRow}>
        <button className={styles.secondaryBtn} onClick={shareWhatsApp}>
          <span className={styles.icon}>💚</span>
          {t('whatsappShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareTelegram}>
          <span className={styles.icon}>✈️</span>
          {t('telegramShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareSMS}>
          <span className={styles.icon}>💬</span>
          {t('smsShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareEmail}>
          <span className={styles.icon}>📧</span>
          {t('emailShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={() => setShowQR((v) => !v)}>
          <span className={styles.icon}>📷</span>
          {t('qrShareLabel')}
        </button>
      </div>

      {showQR && (
        <div className={styles.qrDisplay}>
          <div className={styles.qrWrap}>
            <QRCodeCanvas
              value={inviteLink}
              size={180}
              fgColor="#2a241a"
              bgColor="#ffffff"
              level="H"
            />
            {/* DDCircle 액센트 점 (중앙) */}
            <div className={styles.qrAccent}>
              <div className={styles.qrAccentInner} />
            </div>
          </div>
          <p>{t('qrHint')}</p>
        </div>
      )}

      <div className={styles.divider}>{t('inviteDividerOr')}</div>

      {/* 닉네임 검색 (백엔드 필요 — 준비 중) */}
      <div className={styles.extraOptions}>
        <button
          className={styles.extraBtn}
          onClick={() => showToast('🛠️', t('nicknameSoon'))}
        >
          <span className={styles.icon}>🔍</span>
          {t('nicknameSearchLabel')}
          <span className={styles.arrow}>{t('comingSoonBadge')}</span>
        </button>
      </div>

      <div className={styles.notice}>{t('inviteNotice')}</div>
    </Modal>
  );
}
