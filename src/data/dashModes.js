// Dash 4종 — 걷기 / 슬로우 러닝 / 전력질주 / 자유 종목.
// 모두 자동측정(DPulses+강도), 이동거리 무관(제자리든 이동이든).
// 이름·설명은 번역 키(labelKey/descKey)로 두어 15개 언어로 확장 가능하게 한다.
export const DASH_MODES = [
  {
    key: 'walk', emoji: '🚶',
    labelKey: 'dashModeWalk', descKey: 'dashModeWalkDesc',
  },
  {
    key: 'slowrun', emoji: '🏃',
    labelKey: 'dashModeSlowRun', descKey: 'dashModeSlowRunDesc',
  },
  {
    key: 'sprint', emoji: '⚡',
    labelKey: 'dashModeSprint', descKey: 'dashModeSprintDesc',
  },
  {
    key: 'free', emoji: '🔀',
    labelKey: 'dashModeFree', descKey: 'dashModeFreeDesc',
  },
];

export function getDashMode(key) {
  return DASH_MODES.find((m) => m.key === key) || DASH_MODES[0];
}

// Dash EP 종목별 배율 (v2.2) — Dash EP = 10(고정) × 배율 × 스트릭 부스터.
// 레벨(Lv.1~4) 배율 폐지. 종목은 EP 양에만 영향(스트릭엔 영향 없음).
export const DASH_MODE_MULTIPLIER = {
  walk: 1.0,     // 걷기
  slowrun: 1.5,  // 슬로우 러닝(Zone 2)
  sprint: 2.0,   // 전력질주
  free: 1.5,     // 자유 종목(혼합)
};

export function dashModeMultiplier(key) {
  return DASH_MODE_MULTIPLIER[key] ?? 1.0;
}
