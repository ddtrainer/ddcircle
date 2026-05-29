// 닉네임 뱃지 렌더링 (스펙 7장 — 닉네임 뱃지 시스템)
// 우선순위: Coach 🧭 > Pioneer 🌲 > Master 🌲 Master {로마숫자} > Lv.4+Lv.4 🌲
//
// coach / pioneer / master_level 프로필 필드는 아직 백엔드에 존재하지 않는다.
// 해당 필드가 추가되면 자동으로 활성화되도록 미리 분기를 넣어둔다.
// 현재 실제로 동작하는 분기는 Deep Lv.4 + Dash Lv.4 → 🌲 뿐이다.
import { MAX_LEVEL } from './ddLevel';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function toRoman(n) {
  return ROMAN[n] || String(n);
}

// profile: { nickname, coach?, pioneer?, master_level? }
// levels:  { deepLevel, dashLevel } — 현재 사용자의 DD 레벨 (선택)
export function renderNickname(profile, levels = null) {
  const nickname = profile?.nickname || '';
  if (!nickname) return '';

  if (profile?.coach) return `${nickname} 🧭 DD Coach`;
  if (profile?.pioneer) return `${nickname} 🌲 Pioneer`;
  if (profile?.master_level >= 1) {
    return `${nickname} 🌲 Master ${toRoman(profile.master_level)}`;
  }
  if (levels && levels.deepLevel >= MAX_LEVEL && levels.dashLevel >= MAX_LEVEL) {
    return `${nickname} 🌲`;
  }
  return nickname;
}
