// 인스타 스토리(9:16, 1080x1920) 결과 카드 생성 — 셀카 없이 시적/조용한 카드
// 반환: Blob (PNG)

const W = 1080;
const H = 1920;

// 무드별 시적 카피 (ko/en)
const MOOD_COPY = {
  alive:   { ko: '살아있네~ DD했다~^^',              en: 'Alive today, DD done!' },
  proud:   { ko: '이 평범한 3분이 1년 뒤를 바꿔요.', en: 'These plain three minutes shape a year.' },
  joyful:  { ko: '즐거움이 가득한 하루였어요.',       en: 'A day full of joy.' },
  didIt:   { ko: '조용히 한 걸음, 오늘도 충분해요.', en: 'A quiet step. Today is enough.' },
  hard:    { ko: '버틴 것도 잘한 거예요.',           en: 'Showing up was enough today.' },
  blue:    { ko: '가라앉은 날에도, 숨은 멈추지 않았어요.', en: 'Even on a low day, breath kept going.' },
  anxious: { ko: '잠시 멈춰 깊은 호흡, 그걸로 충분해요.', en: 'A pause, a breath. Enough.' },
  tired:   { ko: '지친 마음에도 숨이 닿았어요.',     en: 'Even tired, breath found you.' },
};

// 스트릭 기반 폴백 카피
function streakCopy(streak, lang) {
  if (lang === 'en') {
    if (streak >= 100) return '100 days of breathing together.';
    if (streak >= 30) return 'This breath is becoming everyday.';
    if (streak >= 7) return 'Small promises, quietly stacking.';
    if (streak >= 1) return "Today's three minutes shape tomorrow.";
    return 'A first breath has begun.';
  }
  if (streak >= 100) return '100일을 함께한 호흡.';
  if (streak >= 30) return '이 호흡이 일상이 되어가요.';
  if (streak >= 7) return '작은 약속이 조용히 쌓여요.';
  if (streak >= 1) return '오늘의 3분이 내일을 만들어요.';
  return '첫 호흡을 시작했어요.';
}

function pickCopy(mood, streak, lang) {
  if (mood && MOOD_COPY[mood]) {
    return MOOD_COPY[mood][lang === 'en' ? 'en' : 'ko'];
  }
  return streakCopy(streak, lang);
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

  // 상단 — 좌측 브랜드, 우측 날짜
  ctx.textAlign = 'left';
  ctx.fillStyle = '#5a4d38';
  ctx.font = 'bold 30px "Inter", sans-serif';
  ctx.fillText('DDCIRCLE', 100, 150);

  ctx.textAlign = 'right';
  ctx.font = '500 30px "Inter", sans-serif';
  ctx.fillStyle = '#9a8a70';
  ctx.fillText(formatDate(lang), W - 100, 150);

  // 큰 아바타 (중앙 상단)
  drawAvatar(ctx, W / 2, 540, 180, emojiBg, emoji);

  // 닉네임
  ctx.fillStyle = '#2a241a';
  ctx.font = 'bold 64px "Noto Serif KR", serif';
  ctx.textAlign = 'center';
  ctx.fillText(nickname, W / 2, 830);

  // 시적 카피 (mood 기반)
  const copy = pickCopy(mood, streak, lang);
  ctx.fillStyle = '#3a2f20';
  ctx.font = `italic 600 ${lang === 'en' ? '64px' : '70px'} "Noto Serif KR", serif`;
  const lines = wrapText(ctx, copy, W - 200);
  let y = 1100;
  lines.forEach((line) => {
    ctx.fillText(line, W / 2, y);
    y += lang === 'en' ? 88 : 96;
  });

  // 통계 라인 (작게)
  const stats = [];
  stats.push(lang === 'en' ? `🔥 ${streak}-day streak` : `🔥 ${streak}일 연속`);
  stats.push(`+${ep} EP`);
  if (exerciseLabel) stats.push(`💪 ${exerciseLabel}`);
  ctx.fillStyle = '#5a4d38';
  ctx.font = '500 38px "Inter", "Noto Serif KR", sans-serif';
  ctx.fillText(stats.join('  ·  '), W / 2, y + 80);

  // 하단 카피
  ctx.fillStyle = '#7a6d58';
  ctx.font = `italic 38px "Noto Serif KR", serif`;
  const subText = lang === 'ko' ? '매일 3분, 함께 호흡하는 작은 의식' : 'A three-minute daily breath together';
  ctx.fillText(subText, W / 2, 1720);

  ctx.fillStyle = '#1e9bd8';
  ctx.font = 'bold 36px "Inter", sans-serif';
  ctx.fillText('ddcircle.app', W / 2, 1810);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

// 공유 (Web Share API) 또는 다운로드 fallback
// URL을 함께 전달해서 받는 쪽에서 카드를 탭하면 DDCircle 웹앱으로 접속 가능하게 함
// (카카오톡, iMessage, 디스코드, 슬랙 등 대부분의 메신저에서 작동)
export async function shareOrDownload(blob, filename = 'ddcircle-today.png', opts = {}) {
  const {
    url = 'https://www.ddcircle.app?ref=share-card',
    title = 'DDCircle',
    text = '매일 3분, 함께 호흡하는 작은 의식\nhttps://www.ddcircle.app',
  } = opts;

  const file = new File([blob], filename, { type: 'image/png' });

  // 1차: files + url + text 모두 전달 (지원 플랫폼에서 카드+링크 함께 표시)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    // 일부 플랫폼은 files+url 조합을 거부 — 가능 여부 사전 체크
    let payload = { files: [file], title, text };
    try {
      if (navigator.canShare({ files: [file], url, title, text })) {
        payload = { files: [file], title, text, url };
      }
    } catch { /* canShare가 throw하면 url 없이 진행 */ }

    try {
      await navigator.share(payload);
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
      // DataError 등이면 url 빼고 한 번 더 시도
      if (payload.url) {
        try {
          await navigator.share({ files: [file], title, text });
          return 'shared';
        } catch (e2) {
          if (e2.name === 'AbortError') return 'cancelled';
        }
      }
      // fallthrough to download
    }
  }

  // 2차 fallback: 다운로드 + 클립보드에 링크 복사 (사용자가 직접 첨부+붙여넣기)
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  } catch { /* ignore */ }

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  return 'downloaded';
}
