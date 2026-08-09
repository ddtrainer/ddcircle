// 인스타 스토리(9:16, 1080x1920) 결과 카드 생성 — 셀카 없이 시적/조용한 카드
// 반환: Blob (PNG)
import QRCode from 'qrcode';
import { shareBaseUrl } from '../config/piNet';

const W = 1080;
const H = 1920;

// QR·공유 링크는 PiNet 주소 기준 — 스캔하거나 누른 사람의 기기에서 OS가 Pi Browser로
// 바로 열어주기 때문에 Pi 로그인까지 그대로 이어진다. (config/piNet.js 참고)
// 카드 하단에 글자로 찍히는 'ddcircle.app'은 사람이 읽는 브랜드 표기라 그대로 둔다.
const shareUrl = () => `${shareBaseUrl()}/?ref=share-card`;

// 무드별 시적 카피 — 무드 id → i18n 키. 실제 문구는 locale 파일(resultCardMood*)에서 15개 언어로 관리.
const MOOD_KEYS = {
  alive: 'resultCardMoodAlive',
  proud: 'resultCardMoodProud',
  joyful: 'resultCardMoodJoyful',
  didIt: 'resultCardMoodDidIt',
  hard: 'resultCardMoodHard',
  blue: 'resultCardMoodBlue',
  anxious: 'resultCardMoodAnxious',
  tired: 'resultCardMoodTired',
};

// 스트릭 기반 폴백 카피
function streakCopy(streak, t) {
  if (streak >= 100) return t('resultCardStreak100');
  if (streak >= 30) return t('resultCardStreak30');
  if (streak >= 7) return t('resultCardStreak7');
  if (streak >= 1) return t('resultCardStreak1');
  return t('resultCardStreak0');
}

function pickCopy(mood, streak, t) {
  if (mood && MOOD_KEYS[mood]) {
    return t(MOOD_KEYS[mood]);
  }
  return streakCopy(streak, t);
}

// 카드 위에 텍스트를 여러 줄로 그리기 (최대 너비 안 넘게 wrap)
function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// 둥근 그라데이션 원 (아바타 배경)
function drawAvatar(ctx, cx, cy, r, gradientCss, emoji) {
  // gradientCss 형태: "linear-gradient(135deg,#fbb040,#f97b9c)"
  const match = gradientCss && gradientCss.match(/#([0-9a-fA-F]{6})[^#]*#([0-9a-fA-F]{6})/);
  let c1 = '#fbb040', c2 = '#f97b9c';
  if (match) { c1 = '#' + match[1]; c2 = '#' + match[2]; }

  // 그림자
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;

  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 이모지
  ctx.font = `${r * 1.1}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji || '🌸', cx, cy + 4);
}

function formatDate(lang = 'ko') {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export async function generateResultCard({
  ep,
  streak,
  mood,
  exerciseLabel,
  nickname = 'DD',
  emoji = '🌸',
  emojiBg = 'linear-gradient(135deg,#fbb040,#f97b9c)',
  lang = 'ko',
  t = (key) => key, // useLang()의 번역 함수. 호출부(Complete.jsx)가 항상 넘겨준다.
  userMessage = '',  // 사용자가 완료 화면 textarea에 쓴 글 — mood 카피 아래 인용
}) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#faf6ee');
  grad.addColorStop(0.5, '#fdf3e8');
  grad.addColorStop(1, '#e8f4fb');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 부드러운 글로우
  const glow1 = ctx.createRadialGradient(180, 280, 0, 180, 280, 500);
  glow1.addColorStop(0, 'rgba(244,119,48,0.14)');
  glow1.addColorStop(1, 'rgba(244,119,48,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(900, 1640, 0, 900, 1640, 540);
  glow2.addColorStop(0, 'rgba(30,155,216,0.14)');
  glow2.addColorStop(1, 'rgba(30,155,216,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 상단 — 좌측 DDCircle 심볼 로고, 우측 날짜
  const LOGO_X = 90;
  const LOGO_Y = 80;
  const LOGO_H = 185;
  const headerMidY = LOGO_Y + LOGO_H / 2; // 로고 세로 중심 — 날짜를 여기에 맞춘다
  try {
    // 배경이 투명한 원형 심볼 로고. 이전 워드마크 PNG는 배경이 불투명 단색(#faf6ee)이라,
    // 이 카드처럼 배경이 그라데이션이면 로고 자리에만 색이 어긋나 흰 네모가 그대로 드러났다.
    const logoImg = await loadImage('/dd-logo-circle.png');
    const logoW = Math.round((LOGO_H * (logoImg.naturalWidth || 580)) / (logoImg.naturalHeight || 565));
    ctx.drawImage(logoImg, LOGO_X, LOGO_Y, logoW, LOGO_H);
  } catch (e) {
    // 로고 로드 실패 시 텍스트 폴백
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5a4d38';
    ctx.font = 'bold 56px "Inter", sans-serif';
    ctx.fillText('DDCIRCLE', LOGO_X + 10, headerMidY);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '500 34px "Inter", sans-serif';
  ctx.fillStyle = '#9a8a70';
  ctx.fillText(formatDate(lang), W - 100, headerMidY);
  ctx.textBaseline = 'alphabetic'; // 이후 텍스트 baseline 원복

  // 큰 아바타 (중앙 상단)
  drawAvatar(ctx, W / 2, 540, 180, emojiBg, emoji);

  // 닉네임
  ctx.fillStyle = '#2a241a';
  ctx.font = 'bold 64px "Noto Serif KR", serif';
  ctx.textAlign = 'center';
  ctx.fillText(nickname, W / 2, 830);

  // 시적 카피 (mood 기반)
  const copy = pickCopy(mood, streak, t);
  ctx.fillStyle = '#3a2f20';
  ctx.font = `italic 600 ${lang === 'en' ? '64px' : '70px'} "Noto Serif KR", serif`;
  const lines = wrapText(ctx, copy, W - 200);
  let y = 1100;
  lines.forEach((line) => {
    ctx.fillText(line, W / 2, y);
    y += lang === 'en' ? 88 : 96;
  });

  // 사용자가 직접 쓴 글 — mood 카피 아래에 따옴표 묶음으로 (있을 때만)
  const userMsg = (userMessage || '').trim().slice(0, 120);
  if (userMsg) {
    ctx.fillStyle = '#5a4d38';
    ctx.font = `400 ${lang === 'en' ? '38px' : '42px'} "Noto Serif KR", serif`;
    const userLines = wrapText(ctx, `"${userMsg}"`, W - 240);
    y += 24;
    userLines.slice(0, 3).forEach((line) => {  // 최대 3줄
      ctx.fillText(line, W / 2, y);
      y += lang === 'en' ? 54 : 60;
    });
  }

  // 통계 라인 (작게)
  const stats = [];
  stats.push(`🔥 ${t('resultCardStreakDays', { n: streak })}`);
  stats.push(`+${ep} EP`);
  if (exerciseLabel) stats.push(`💪 ${exerciseLabel}`);
  ctx.fillStyle = '#5a4d38';
  ctx.font = '500 38px "Inter", "Noto Serif KR", sans-serif';
  ctx.fillText(stats.join('  ·  '), W / 2, y + 80);

  // 하단 카피 (좌측 정렬, QR과 균형)
  ctx.textAlign = 'left';
  const leftX = 90;
  ctx.fillStyle = '#7a6d58';
  ctx.font = `italic 32px "Noto Serif KR", serif`;
  const subText = t('resultCardTagline1');
  const subText2 = t('resultCardTagline2');
  ctx.fillText(subText, leftX, 1720);
  ctx.fillText(subText2, leftX, 1760);

  ctx.fillStyle = '#1e9bd8';
  ctx.font = 'bold 40px "Inter", sans-serif';
  ctx.fillText('ddcircle.app', leftX, 1820);

  // QR 코드 — 우측 하단 (스캔하여 웹앱 진입)
  try {
    const qrSize = 220;
    const qrX = W - qrSize - 70;
    const qrY = 1640;
    const qrDataUrl = await QRCode.toDataURL(shareUrl(), {
      width: qrSize,
      margin: 1,
      color: { dark: '#2a241a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
    const qrImg = await loadImage(qrDataUrl);
    // 흰 배경 + 둥근 모서리 (QR이 카드 배경과 대비되어 잘 스캔되도록)
    drawRoundedRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16, '#ffffff');
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    // QR 아래 작은 안내 텍스트
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5a4d38';
    ctx.font = '600 26px "Inter", "Noto Serif KR", sans-serif';
    const scanLabel = t('resultCardScanLabel');
    ctx.fillText(scanLabel, qrX + qrSize / 2, qrY + qrSize + 50);
  } catch (e) {
    console.warn('[card] QR generation failed:', e);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

// 이미지 로드 헬퍼
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 둥근 사각형 채우기 헬퍼
function drawRoundedRect(ctx, x, y, w, h, r, fillStyle) {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 공유 (Web Share API) 또는 다운로드 fallback
// 카드 이미지와 함께 URL을 항상 전달하고, 추가로 클립보드에도 복사
// → 카카오톡처럼 받는 앱이 URL 본문을 무시해도, 사용자가 채팅창에 한 번에 붙여넣어 친구가 진입 가능
export async function shareOrDownload(blob, filename = 'ddcircle-today.png', opts = {}) {
  const {
    url = shareUrl(),
    title = 'DDCircle',
    text = `매일 3분, 함께 호흡하는 작은 의식\n👉 ${url}`,
  } = opts;

  const file = new File([blob], filename, { type: 'image/png' });

  // 항상 URL을 클립보드에 복사 — 공유 성공 여부와 관계없이 사용자가 채팅에 붙여넣을 수 있도록
  let clipboardOk = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      clipboardOk = true;
    }
  } catch { /* ignore */ }

  // Web Share API + 파일 지원 여부 (모바일은 대부분 OK, PC 브라우저는 거의 미지원)
  const canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [file] }));

  // 모바일: 시스템 공유 시트 띄움
  if (canShareFiles) {
    let payload = { files: [file], title, text };
    try {
      if (navigator.canShare({ files: [file], url, title, text })) {
        payload = { files: [file], title, text, url };
      }
    } catch { /* ignore */ }

    try {
      await navigator.share(payload);
      return clipboardOk ? 'shared+copied' : 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
      if (payload.url) {
        try {
          await navigator.share({ files: [file], title, text });
          return clipboardOk ? 'shared+copied' : 'shared';
        } catch (e2) {
          if (e2.name === 'AbortError') return 'cancelled';
        }
      }
      // 공유 실패 — 아래 unsupported 분기로
    }
  }

  // PC 등 Web Share 미지원: 자동 다운로드 안 함 (브라우저 보안 팝업 회피)
  // 클립보드 복사된 링크를 사용자가 직접 채팅에 붙여넣도록 안내
  return clipboardOk ? 'unsupported+copied' : 'unsupported';
}
