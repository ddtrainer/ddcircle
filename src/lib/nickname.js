// 닉네임 뱃지 렌더링 (스펙 7장 — 닉네임 뱃지 시스템)
// 우선순위: Coach 🧭 > Pioneer 🌲 > Master 🌲 Master {로마숫자} > 전문(Lv.4)+전문(Lv.4) 🌸
//
// ※ 🌸는 식물 티어가 아니라 '두 트랙 모두 최고 티어(전문) 달성' 축하 플레어다.
//    (DD 단계명은 입문·기본·숙련·전문으로 역할 분리됨. 식물 은유는 생명나무 전용.)
// coach / pioneer / master_level 프로필 필드는 아직 백엔드에 존재하지 않는다.
// 해당 필드가 추가되면 자동으로 활성화되도록 미리 분기를 넣어둔다.
// 현재 실제로 동작하는 분기는 Deep Lv.4 + Dash Lv.4 → 🌸 뿐이다.
import { MAX_LEVEL } from './ddLevel';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function toRoman(n) {
  return ROMAN[n] || String(n);
}

// profile: { nickname, coach?, pioneer?, master_level? }
// levels:  { deepLevel, streak } — Deep 레벨 + 통합 스트릭 (선택)
// v2.2: Pioneer/🌸 조건 = Deep Lv.4 + Dash 스트릭 21일. (Dash 레벨 폐지)
//   Dash는 항상 흐름에 포함되므로 통합 스트릭을 Dash 스트릭으로 사용.
const PIONEER_STREAK = 21;
export function renderNickname(profile, levels = null) {
  const nickname = profile?.nickname || '';
  if (!nickname) return '';

  if (profile?.coach) return `${nickname} 🧭 DD Coach`;
  if (profile?.pioneer) return `${nickname} 🌲 Pioneer`;
  if (profile?.master_level >= 1) {
    return `${nickname} 🌲 Master ${toRoman(profile.master_level)}`;
  }
  if (levels && levels.deepLevel >= MAX_LEVEL && (levels.streak || 0) >= PIONEER_STREAK) {
    return `${nickname} 🌸`;
  }
  return nickname;
}
