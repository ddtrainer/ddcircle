// OG 이미지 자동 생성 스크립트 (SVG → PNG via sharp)
// 실행: node scripts/generate-og-image.mjs
// 산출: public/og-image.png (1200×630)
//
// 텍스트/URL 수정 시 이 파일만 편집하고 재실행하세요.

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const W = 1200;
const H = 630;
const URL_TEXT = 'ddcircle.app';
const HEADLINE_LINE1 = '매일 3분,';
const HEADLINE_LINE2 = '함께 호흡하는 작은 의식';

async function main() {
  // dd-logo.png를 base64로 인코딩하여 SVG에 임베드
  const logoPath = join(ROOT, 'public', 'dd-logo.png');
  const logoBase64 = readFileSync(logoPath).toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  // 로고 원본 비율 측정 (sharp로)
  const logoMeta = await sharp(logoPath).metadata();
  const logoH = 360;
  const logoW = (logoMeta.width / logoMeta.height) * logoH;
  const logoX = 90;
  const logoY = (H - logoH) / 2;

  // SVG 마크업
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#faf6ee"/>
      <stop offset="55%" stop-color="#fcf2e3"/>
      <stop offset="100%" stop-color="#eef6fb"/>
    </linearGradient>
    <radialGradient id="glowL" cx="180" cy="180" r="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(244,119,48,0.20)"/>
      <stop offset="100%" stop-color="rgba(244,119,48,0)"/>
    </radialGradient>
    <radialGradient id="glowR" cx="1020" cy="480" r="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(30,155,216,0.18)"/>
      <stop offset="100%" stop-color="rgba(30,155,216,0)"/>
    </radialGradient>
  </defs>

  <!-- 배경 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glowL)"/>
  <rect width="${W}" height="${H}" fill="url(#glowR)"/>

  <!-- DD 로고 -->
  <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}"/>

  <!-- 메인 카피 -->
  <text x="580" y="280"
        font-family="'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
        font-size="78" font-weight="700" fill="#1a1612">
    ${HEADLINE_LINE1}
  </text>
  <text x="580" y="380"
        font-family="'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
        font-size="60" font-weight="700" fill="#1a1612">
    ${HEADLINE_LINE2}
  </text>

  <!-- URL (우측 하단) -->
  <text x="${W - 60}" y="${H - 50}"
        font-family="'Inter', -apple-system, sans-serif"
        font-size="36" font-weight="500" fill="#5a4d38"
        text-anchor="end">
    ${URL_TEXT}
  </text>
</svg>`;

  // SVG → PNG (sharp가 한국어 폰트 렌더링)
  const outPath = join(ROOT, 'public', 'og-image.png');
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  const stats = (await sharp(outPath).metadata());
  console.log(`✓ Generated: ${outPath}`);
  console.log(`  ${stats.width}×${stats.height} · ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
