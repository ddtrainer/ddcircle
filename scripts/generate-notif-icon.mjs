// 푸시 알림용 러닝 아이콘 PNG 생성 (192x192)
// 단순한 스틱맨 러너 + DDCircle 워밍 컬러
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '..', 'public', 'notif-running.png');

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <!-- 둥근 베이지 배경 -->
  <rect width="192" height="192" rx="40" fill="#faf6ee"/>
  <!-- 머리 -->
  <circle cx="118" cy="50" r="16" fill="#f47730"/>
  <!-- 몸통 (러닝 자세, 살짝 기울어짐) -->
  <path d="M110 70 L122 118" stroke="#f47730" stroke-width="12" fill="none" stroke-linecap="round"/>
  <!-- 앞으로 뻗은 팔 -->
  <path d="M114 80 L150 70" stroke="#f47730" stroke-width="11" fill="none" stroke-linecap="round"/>
  <!-- 뒤로 휘두른 팔 -->
  <path d="M114 80 L80 95" stroke="#f47730" stroke-width="11" fill="none" stroke-linecap="round"/>
  <!-- 앞으로 뻗은 다리 -->
  <path d="M122 118 L155 145" stroke="#f47730" stroke-width="13" fill="none" stroke-linecap="round"/>
  <!-- 뒤로 차는 다리 -->
  <path d="M122 118 L82 158" stroke="#f47730" stroke-width="13" fill="none" stroke-linecap="round"/>
  <!-- 속도감 모션 라인 -->
  <line x1="40" y1="100" x2="65" y2="100" stroke="#a8c3d1" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
  <line x1="30" y1="120" x2="60" y2="120" stroke="#a8c3d1" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
  <line x1="45" y1="80" x2="65" y2="80" stroke="#a8c3d1" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
</svg>`;

await sharp(Buffer.from(SVG)).png().toFile(out);
console.log(`Generated: ${out}`);
