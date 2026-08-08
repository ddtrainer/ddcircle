import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import { FRIENDS } from '../../data/friends';
import Modal from './Modal';
import { track, Events } from '../../utils/analytics';
import { shareToKakao } from '../../utils/kakaoShare';
import styles from './InviteModal.module.css';

// Pi Browser를 비롯한 인앱 웹뷰에는 Web Share API가 없다. 없는 환경에서 "공유하기"를
// 보여주면 눌러도 링크 복사밖에 안 되어 "버튼이 고장났다"로 읽히므로, 지원하는
// 브라우저에서만 노출하고 그 외에는 아래 개별 앱 버튼들이 공유 수단이 된다.
const CAN_WEB_SHARE = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

const MAX_CIRCLE = 12;

export default function InviteModal({ open, onClose }) {
  const { t } = useLang();
  const { inviteLink } = useApp();
  const { show: showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // 클립보드 쓰기. clipboard API는 프로미스지만 권한 판정은 호출 시점(사용자 제스처)에
  // 이뤄지므로, 호출부에서 await 없이 시작해도 된다 — 뒤이어 window.open을 같은 제스처
  // 안에서 동기로 실행해야 팝업 차단을 피할 수 있기 때문에 이 구분이 중요하다.
  const writeClipboard = (text) => {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    // 폴백: textarea (동기)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  };

  const copyLink = async () => {
    try {
      await writeClipboard(inviteLink);
      setCopied(true);
      showToast('✓', t('linkCopiedToast'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('⚠️', t('linkCopiedToast'));
    }
  };

  // 공유 — 기기 기본 공유 시트(navigator.share)를 연다. 국가마다 깔린 메신저가
  // 다르므로(WhatsApp/Telegram/카카오톡/Messages 등) 특정 앱을 하드코딩하지 않고
  // OS가 알아서 목록을 보여주게 둔다. CAN_WEB_SHARE일 때만 렌더되므로 여기선
  // 폴백을 신경 쓰지 않아도 된다.
  const share = async () => {
    track(Events.INVITE_SENT, { channel: 'webshare' });
    try {
      await navigator.share({
        title: t('inviteShareTitle'),
        text: t('inviteShareText'),
        url: inviteLink,
      });
    } catch (e) {
      if (e.name === 'AbortError') return; // 사용자 취소
      copyLink();
    }
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

  // 카카오톡은 wa.me/t.me 같은 공개 공유 URL이 없어 SDK를 써야 한다(클릭 시 동적 로드).
  // SDK 로드·초기화·공유 중 어디서 실패하든 false가 오므로 링크 복사로 폴백한다.
  const shareKakao = async () => {
    track(Events.INVITE_SENT, { channel: 'kakao' });
    // 복사는 반드시 지금(사용자 제스처 안에서) 해둔다 — SDK 로드와 실행 확인을 기다린
    // 뒤에는 제스처 컨텍스트가 풀려서 클립보드 쓰기가 거부된다. 카카오톡이 정상적으로
    // 열리는 경우에도 복사가 남아 있는 건 해가 없다.
    writeClipboard(`${t('inviteShareText')} ${inviteLink}`).catch(() => {});
    showToast('💛', t('kakaoOpening'));
    const ok = await shareToKakao({
      title: t('inviteShareTitle'),
      description: t('inviteShareText'),
      link: inviteLink,
    });
    if (!ok) showToast('💛', t('kakaoPasteHint'));
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

  // 페이스북은 내 피드에 게시하는 방식(1:1 전송이 아님). 문구를 파라미터로 미리 채우는
  // 기능은 페이스북이 폐기해서, 공유 카드에 보이는 제목·설명·이미지는 링크 페이지의
  // Open Graph 태그에서만 나온다 — 여기서 text를 넘겨봐야 무시된다.
  //
  // 게다가 모바일 웹 작성창은 링크 미리보기만 붙어 있고 본문이 비면 "게시물에 내용을
  // 추가한 후 다시 시도해주세요"라며 게시를 막는다. 우리가 본문을 채워줄 방법이 없으니,
  // 인사말을 클립보드에 담아두고 붙여넣기만 하면 되게 안내한다. (링크는 미리보기로 이미
  // 붙으므로 링크는 빼고 인사말만 복사 — 안 그러면 주소가 두 번 나온다)
  const shareFacebook = () => {
    track(Events.INVITE_SENT, { channel: 'facebook' });
    // await하지 않는다 — 뒤의 window.open이 같은 사용자 제스처 안에서 실행돼야 안 막힌다.
    writeClipboard(t('inviteShareText')).catch(() => { /* 복사 실패해도 공유는 계속 */ });
    showToast('💙', t('facebookPasteHint'));
    const u = encodeURIComponent(inviteLink);
    openExternal(`https://www.facebook.com/sharer/sharer.php?u=${u}`);
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

      {/* 공유 — 기기 기본 공유 시트. Web Share를 지원하는 브라우저에서만 노출한다
          (Pi Browser 등 미지원 환경에선 눌러도 복사밖에 안 돼 오해를 부른다) */}
      {CAN_WEB_SHARE && (
        <button className={styles.shareBtn} onClick={share}>
          <span className={styles.shareIcon}>📤</span>
          {t('shareLabel')}
        </button>
      )}

      {/* navigator.share 미지원 환경(Pi Browser 등)에서도 바로 쓸 수 있는 개별 채널 버튼.
          순서는 Pi 사용자 분포 기준 — 상위 국가가 나이지리아·인도·베트남·인도네시아·필리핀이라
          WhatsApp(나이지리아·인도·인도네시아 기본 메신저) → 페이스북(필리핀·베트남, Pi 커뮤니티가
          FB 그룹에서 조직됨) → 텔레그램(크립토 네이티브) → 카카오톡(한국) 순.
          문자·QR은 범용 폴백이라 뒤로. */}
      <div className={styles.secondaryRow}>
        <button className={styles.secondaryBtn} onClick={shareWhatsApp}>
          <span className={styles.icon}>💚</span>
          {t('whatsappShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareFacebook}>
          <span className={styles.icon}>💙</span>
          {t('facebookShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareTelegram}>
          <span className={styles.icon}>✈️</span>
          {t('telegramShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareKakao}>
          <span className={styles.icon}>💛</span>
          {t('kakaoShareLabel')}
        </button>
        <button className={styles.secondaryBtn} onClick={shareSMS}>
          <span className={styles.icon}>💬</span>
          {t('smsShareLabel')}
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
