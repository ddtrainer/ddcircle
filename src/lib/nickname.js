// 닉네임 뱃지 렌더링 (스펙 7장 — 닉네임 뱃지 시스템)
// 우선순위: Coach 🧭 > Pioneer 🌲 > Master 🌲 Master {로마숫자} > 전문(Lv.4)+전문(Lv.4) 🌸
//
// ※ 🌸는 식물 티어가 아니라 '자유선택제 전환 후 통합 스트릭 21일' 축하 플레어다.
//    (v2.3: Deep/Dash 모두 레벨 폐지 → 실력 = 누적 스트릭/EP. 종목 = 오늘의 선택.)
// coach / pioneer / master_level 프로필 필드는 아직 백엔드에 존재하지 않는다.
// 해당 필드가 추가되면 자동으로 활성화되도록 미리 분기를 넣어둔다.
// 현재 실제로 동작하는 분기는 통합 스트릭 21일 → 🌸 뿐이다.

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

export function toRoman(n) {
  return ROMAN[n] || String(n);
}

// profile: { nickname, coach?, pioneer?, master_level? }
// levels:  { streak } — 통합 스트릭 (선택)
// v2.3: Pioneer/🌸 조건 = 통합 스트릭 21일. (Deep·Dash 레벨 모두 폐지)
//   Deep·Dash가 하루에 함께 흐르므로 통합 스트릭 하나로 판정.
const PIONEER_STREAK = 21;
export function renderNickname(profile, levels = null) {
  const nickname = profile?.nickname || '';
  if (!nickname) return '';

  if (profile?.coach) return `${nickname} 🧭 DD Coach`;
  if (profile?.pioneer) return `${nickname} 🌲 Pioneer`;
  if (profile?.master_level >= 1) {
    return `${nickname} 🌲 Master ${toRoman(profile.master_level)}`;
  }
  if (levels && (levels.streak || 0) >= PIONEER_STREAK) {
    return `${nickname} 🌸`;
  }
  return nickname;
}
