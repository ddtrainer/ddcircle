// 생명나무 레벨별 SVG (6단계 생애주기: 씨앗 → 새싹 → 나무 → 꽃 → 열매 → 별나무)
const TREES = {
  // 1. 씨앗 — 흙 위에 놓인 씨앗 (아직 싹트기 전)
  1: (
    <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <ellipse cx="90" cy="150" rx="52" ry="7" fill="#2ba48f" opacity="0.15" />
      <path d="M 48 148 Q 90 134 132 148 Z" fill="#8b6f3a" opacity="0.25" />
      <ellipse cx="90" cy="118" rx="17" ry="25" transform="rotate(-8 90 118)" fill="#8b6f3a" />
      <ellipse cx="90" cy="118" rx="17" ry="25" transform="rotate(-8 90 118)" fill="none" stroke="#6f5628" strokeWidth="1.5" opacity="0.5" />
      <path d="M 90 96 Q 92 118 90 140" stroke="#6f5628" strokeWidth="1.5" fill="none" opacity="0.4" />
      <ellipse cx="83" cy="108" rx="5" ry="11" transform="rotate(-14 83 108)" fill="#a8855a" opacity="0.6" />
    </svg>
  ),
  // 2. 새싹 — 떡잎 두 장
  2: (
    <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <ellipse cx="90" cy="160" rx="55" ry="6" fill="#2ba48f" opacity="0.15" />
      <path d="M 88 160 Q 88 130 88 110" stroke="#7ed957" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 88 130 Q 75 125 70 115" stroke="#7ed957" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="68" cy="113" rx="8" ry="4" transform="rotate(-30 68 113)" fill="#7ed957" />
      <path d="M 88 120 Q 100 115 105 105" stroke="#7ed957" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="107" cy="103" rx="8" ry="4" transform="rotate(30 107 103)" fill="#7ed957" />
      <ellipse cx="88" cy="105" rx="6" ry="10" fill="#7ed957" />
    </svg>
  ),
  // 3. 나무 — 줄기와 둥근 수관을 갖춘 나무
  3: (
    <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <ellipse cx="90" cy="162" rx="68" ry="9" fill="#2ba48f" opacity="0.22" />
      <path d="M 88 162 L 88 80" stroke="#7a5a2e" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 88 130 Q 65 118 50 100" stroke="#7a5a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 88 115 Q 115 102 130 85" stroke="#7a5a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 88 100 Q 75 92 65 80" stroke="#7a5a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="68" r="32" fill="#2ba48f" />
      <circle cx="65" cy="80" r="20" fill="#3bbfb0" />
      <circle cx="115" cy="74" r="22" fill="#3bbfb0" />
      <circle cx="45" cy="95" r="14" fill="#7ed957" />
      <circle cx="135" cy="80" r="13" fill="#7ed957" />
      <circle cx="75" cy="55" r="10" fill="#7ed957" opacity="0.7" />
      <circle cx="100" cy="60" r="11" fill="#7ed957" opacity="0.7" />
    </svg>
  ),
  // 4. 꽃 — 분홍빛 꽃이 활짝 핀 나무
  4: (
    <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <ellipse cx="90" cy="165" rx="80" ry="11" fill="#f97b9c" opacity="0.2" />
      <path d="M 88 165 L 88 65" stroke="#5d4520" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="50" r="42" fill="#f97b9c" opacity="0.7" />
      <circle cx="50" cy="72" r="28" fill="#f97b9c" opacity="0.65" />
      <circle cx="130" cy="62" r="30" fill="#fbb040" opacity="0.7" />
      <circle cx="78" cy="35" r="5" fill="#f47730" />
      <circle cx="105" cy="40" r="5" fill="#f47730" />
    </svg>
  ),
  // 5. 열매 — 무성한 수관에 붉은 열매가 맺힌 나무
  5: (
    <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <ellipse cx="90" cy="164" rx="78" ry="10" fill="#2ba48f" opacity="0.25" />
      <path d="M 88 164 L 88 70" stroke="#5d4520" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M 88 130 Q 60 115 40 95" stroke="#5d4520" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 88 110 Q 120 95 140 75" stroke="#5d4520" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="55" r="38" fill="#2ba48f" />
      <circle cx="55" cy="75" r="26" fill="#3bbfb0" />
      <circle cx="125" cy="65" r="28" fill="#3bbfb0" />
      <circle cx="35" cy="92" r="16" fill="#3bbfb0" />
      <circle cx="70" cy="58" r="7" fill="#f4433a" />
      <circle cx="101" cy="48" r="7" fill="#f4433a" />
      <circle cx="116" cy="72" r="6" fill="#ff6b52" />
      <circle cx="58" cy="82" r="6" fill="#ff6b52" />
      <circle cx="92" cy="78" r="6" fill="#f4433a" />
    </svg>
  ),
  // 6. 별나무 — 별빛이 깃든 완성의 나무
  6: (
    <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <ellipse cx="90" cy="165" rx="82" ry="11" fill="#fbb040" opacity="0.25" />
      <path d="M 88 165 L 88 60" stroke="#5d4520" strokeWidth="11" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="48" r="44" fill="#2ba48f" />
      <circle cx="48" cy="68" r="30" fill="#1e9bd8" />
      <circle cx="132" cy="58" r="32" fill="#3bbfb0" />
      <g fill="#fbb040">
        <path d="M 88 25 L 90 31 L 96 31 L 91 35 L 93 41 L 88 37 L 83 41 L 85 35 L 80 31 L 86 31 Z" />
        <path d="M 50 50 L 51 53 L 54 53 L 52 55 L 53 58 L 50 56 L 47 58 L 48 55 L 46 53 L 49 53 Z" />
        <path d="M 130 35 L 131 38 L 134 38 L 132 40 L 133 43 L 130 41 L 127 43 L 128 40 L 126 38 L 129 38 Z" />
      </g>
    </svg>
  ),
};

export default function TreeSVG({ level = 1 }) {
  return TREES[level] || TREES[1];
}
