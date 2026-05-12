// Canvas로 인스타 스토리(9:16, 1080x1920) 결과 카드 생성
// 반환: Blob (PNG)

const W = 1080;
const H = 1920;

export async function generateResultCard({ ep, streak, mood, exerciseLabel, lang = 'ko' }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경 그라데이션 (DDCircle 브랜드 컬러)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#faf6ee');
  grad.addColorStop(0.5, '#fdf3e8');
  grad.addColorStop(1, '#e8f4fb');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 부드러운 원형 글로우
  const glow1 = ctx.createRadialGradient(180, 280, 0, 180, 280, 400);
  glow1.addColorStop(0, 'rgba(244,119,48,0.18)');
  glow1.addColorStop(1, 'rgba(244,119,48,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(900, 1640, 0, 900, 1640, 460);
  glow2.addColorStop(0, 'rgba(30,155,216,0.18)');
  glow2.addColorStop(1, 'rgba(30,155,216,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 상단 라벨 (DDCircle)
  ctx.fillStyle = '#5a4d38';
  ctx.font = 'bold 36px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '8px';
  ctx.fillText('DDCIRCLE', W / 2, 200);

  // 메인 헤드 (오늘도 성공!)
  ctx.fillStyle = '#2a241a';
  ctx.font = 'bold 96px "Noto Serif KR", serif';
  const titleText = lang === 'ko' ? '오늘도 성공!' : 'Done today!';
  ctx.fillText(titleText, W / 2, 460);

  // 큰 EP 숫자
  const epGrad = ctx.createLinearGradient(0, 600, 0, 900);
  epGrad.addColorStop(0, '#f47730');
  epGrad.addColorStop(1, '#1e9bd8');
  ctx.fillStyle = epGrad;
  ctx.font = 'bold 360px "Inter", sans-serif';
  ctx.fillText(`+${ep}`, W / 2, 940);

  ctx.fillStyle = '#5a4d38';
  ctx.font = '500 56px "Inter", sans-serif';
  ctx.fillText('EP', W / 2, 1020);

  // 메타 박스 (스트릭, 운동, 기분)
  const lines = [];
  lines.push({ icon: '🔥', text: lang === 'ko' ? `${streak}일 연속` : `${streak}-day streak` });
  if (exerciseLabel) lines.push({ icon: '💪', text: exerciseLabel });
  if (mood) lines.push({ icon: '✨', text: mood });

  let y = 1240;
  ctx.font = '500 48px "Noto Serif KR", "Inter", sans-serif';
  ctx.fillStyle = '#2a241a';
  lines.forEach((line) => {
    ctx.fillText(`${line.icon}  ${line.text}`, W / 2, y);
    y += 90;
  });

  // 하단 카피
  ctx.fillStyle = '#5a4d38';
  ctx.font = 'italic 44px "Noto Serif KR", serif';
  const subText = lang === 'ko' ? '매일 3분, 함께 호흡하는 작은 의식' : 'A 3-minute daily ritual';
  ctx.fillText(subText, W / 2, 1700);

  // URL
  ctx.fillStyle = '#1e9bd8';
  ctx.font = 'bold 40px "Inter", sans-serif';
  ctx.fillText('ddcircle.app', W / 2, 1820);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

// 공유 (Web Share API) 또는 다운로드 fallback
export async function shareOrDownload(blob, filename = 'ddcircle-today.png') {
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'DDCircle',
        text: '매일 3분, 함께 호흡하는 작은 의식 · ddcircle.app',
      });
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
      // fallthrough to download
    }
  }

  // Fallback: 다운로드
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
