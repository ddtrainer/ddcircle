// 호흡 프리셋 (들숨-멈춤-날숨, 사이클 수)
export const BREATH_PRESETS = [
  { id: '478', label: '4-7-8', durations: { inhale: 4, hold: 7, exhale: 8 }, cycles: 6 },
  { id: '36',  label: '3-6',   durations: { inhale: 3, hold: 0, exhale: 6 }, cycles: 8 },
];

export const DEFAULT_CUSTOM_BREATH = {
  inhale: 4,
  hold: 4,
  exhale: 4,
  cycles: 6,
};

// 패턴 ID로 전체 호흡 설정 조회 (custom일 때는 user 설정 사용)
export function resolveBreathPattern(patternId, customBreath) {
  if (patternId === 'custom') {
    return {
      id: 'custom',
      label: `${customBreath.inhale}-${customBreath.hold}-${customBreath.exhale}`,
      durations: {
        inhale: customBreath.inhale,
        hold: customBreath.hold,
        exhale: customBreath.exhale,
      },
      cycles: customBreath.cycles,
    };
  }
  return BREATH_PRESETS.find((p) => p.id === patternId) || BREATH_PRESETS[0];
}
