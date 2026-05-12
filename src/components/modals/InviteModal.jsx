import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import { FRIENDS } from '../../data/friends';
import Modal from './Modal';
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

  // 카카오톡 공유 — 우선순위:
  // 1. Kakao SDK sendDefault (이미지 크기 명시로 1200×630 비율 유지)
  // 2. Kakao SDK sendScrap (URL OG 태그 스크래핑 — fallback)
  // 3. navigator.share (모바일 시스템 공유 시트)
  // 4. 링크 자동 복사 + 안내 (데스크톱 / 미지원 환경)
  const shareKakao = async () => {
    const text = t('inviteShareText');
    const title = t('inviteShareTitle');
    const ogImageUrl = window.location.origin + '/og-image.png';

    // 1. sendDefault with explicit imageWidth/Height (1200×630 비율 강제 — 잘림 방지)
    if (typeof window !== 'undefined' && window.Kakao?.Share?.sendDefault) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            description: text,
            imageUrl: ogImageUrl,
            imageWidth: 1200,
            imageHeight: 630,
            link: { mobileWebUrl: inviteLink, webUrl: inviteLink },
          },
          buttons: [{
            title: t('kakaoBtnOpen') || '함께 시작하기',
            link: { mobileWebUrl: inviteLink, webUrl: inviteLink },
          }],
        });
        showToast('💛', t('kakaoOpening'));
        return;
      } catch (e) {
        console.warn('Kakao sendDefault failed, trying sendScrap:', e);
      }
    }

    // 2. Fallback: sendScrap (URL을 카카오톡이 직접 스크래핑)
    if (typeof window !== 'undefined' && window.Kakao?.Share?.sendScrap) {
      try {
        window.Kakao.Share.sendScrap({ requestUrl: inviteLink });
        showToast('💛', t('kakaoOpening'));
        return;
      } catch (e) {
        console.warn('Kakao sendScrap failed:', e);
      }
    }

    // 2. 모바일 Web Share API (시스템 공유 시트 → 카카오톡 선택)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: inviteLink });
        showToast('💛', t('kakaoOpening'));
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; // 사용자 취소
      }
    }

    // 3. Fallback: 링크 자동 복사 + 카카오톡에 붙여넣기 안내
    try {
      await navigator.clipboard?.writeText(inviteLink);
      showToast('📋', t('kakaoFallbackCopied'));
    } catch {
      showToast('⚠️', t('kakaoFallbackError'));
    }
  };

  const shareSMS = () => {
    showToast('💬', t('smsOpening'));
    const body = encodeURIComponent(`${t('inviteShareText')} ${inviteLink}`);
    window.location.href = `sms:?body=${body}`;
  };

  const shareEmail = () => {
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

      {/* 카카오톡 큰 버튼 */}
      <button className={styles.kakaoBtn} onClick={shareKakao}>
        <span className={styles.kakaoIcon}>K</span>
        {t('kakaoShareLabel')}
      </button>

      {/* SMS / 이메일 / QR */}
      <div className={styles.secondaryRow}>
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

      {/* 닉네임 검색 / 카카오 친구 매칭 (백엔드 필요 — 준비 중) */}
      <div className={styles.extraOptions}>
        <button
          className={styles.extraBtn}
          onClick={() => showToast('🛠️', t('nicknameSoon'))}
        >
          <span className={styles.icon}>🔍</span>
          {t('nicknameSearchLabel')}
          <span className={styles.arrow}>{t('comingSoonBadge')}</span>
        </button>
        <button
          className={styles.extraBtn}
          onClick={() => showToast('🛠️', t('contactSyncSoon'))}
        >
          <span className={styles.icon}>📞</span>
          {t('contactSyncLabel')}
          <span className={styles.arrow}>{t('comingSoonBadge')}</span>
        </button>
      </div>

      <div className={styles.notice}>{t('inviteNotice')}</div>
    </Modal>
  );
}
