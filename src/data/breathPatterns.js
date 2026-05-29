// 호흡 프리셋 (들숨-멈춤-날숨-날숨후멈춤, 사이클 수)
export const BREATH_PRESETS = [
  { id: '48',   label: '자연 호흡',         durations: { inhale: 4, hold: 0, exhale: 4, postHold: 0 }, cycles: 6 },
  { id: '478',  label: '4-7-8 이완호흡',   durations: { inhale: 4, hold: 7, exhale: 8, postHold: 0 }, cycles: 6 },
  { id: '4444', label: '4-4-4-4 멘탈호흡', durations: { inhale: 4, hold: 4, exhale: 4, postHold: 4 }, cycles: 6 },
];

export const DEFAULT_CUSTOM_BREATH = {
  inhale: 4,
  hold: 0,
  exhale: 4,
  postHold: 0,
  cycles: 6,
};

// 자연 호흡 기본값 — 4-4 (들숨4/날숨4, 멈춤 없음). 사용자가 조절 가능.
export const DEFAULT_NATURAL_BREATH = {
  inhale: 4,
  hold: 0,
  exhale: 4,
  postHold: 0,
  cycles: 6,
};

function buildBreath(id, b, fallbackLabel) {
  return {
    id,
    label: fallbackLabel ?? `${b.inhale}-${b.hold}-${b.exhale}-${b.postHold ?? 0}`,
    durations: {
      inhale: b.inhale,
      hold: b.hold,
      exhale: b.exhale,
      postHold: b.postHold ?? 0,
    },
    cycles: b.cycles,
  };
}

// 패턴 ID로 전체 호흡 설정 조회
// - 'custom' → 윔호프 호흡 (스크립트 기반, DeepSession에서 별도 처리)
// - '48'     → 자연 호흡 (사용자 조절 가능, naturalBreath 사용)
export function resolveBreathPattern(patternId, customBreath, naturalBreath) {
  if (patternId === 'custom') {
    return buildBreath('custom', customBreath);
  }
  if (patternId === '48' && naturalBreath) {
    return buildBreath('48', { ...naturalBreath }, '자연 호흡');
  }
  return BREATH_PRESETS.find((p) => p.id === patternId) || BREATH_PRESETS[0];
}

// 윔호프 호흡 기본 과호흡 횟수 (사용자 조절 가능, 20~40)
export const DEFAULT_WIM_HOF_ROUNDS = 30;
export const WIM_HOF_RETENTION_SEC = 45;
export const DEFAULT_WIM_HOF_RETENTION = WIM_HOF_RETENTION_SEC;
export const WIM_HOF_RECOVERY = { inhale: 4, hold: 15, exhale: 10 };
export const WIM_HOF_CYCLES = 2;
export const DEFAULT_WIM_HOF_CYCLES = 1;

// 윔호프 호흡 스크립트 생성
// 구조 고정: 과호흡(power) → 숨 참기(retention) → 회복 호흡(recovery)
// 각 step: { phase, duration, stage, round?, totalRounds? }
//   phase: 'inhale' | 'exhale' | 'hold' (orb/사운드/카운터 표시용)
//   stage: 'power' | 'retention' | 'recovery'
export function buildWimHofScript(rounds = DEFAULT_WIM_HOF_ROUNDS, cycles = DEFAULT_WIM_HOF_CYCLES, retention = DEFAULT_WIM_HOF_RETENTION) {
  const steps = [];
  for (let c = 1; c <= cycles; c++) {
    const meta = { cycle: c, totalCycles: cycles };
    for (let i = 1; i <= rounds; i++) {
      steps.push({ phase: 'inhale', duration: 1, stage: 'power', round: i, totalRounds: rounds, ...meta });
      steps.push({ phase: 'exhale', duration: 1, stage: 'power', round: i, totalRounds: rounds, ...meta });
    }
    steps.push({ phase: 'hold', duration: retention, stage: 'retention', ...meta });
    steps.push({ phase: 'inhale', duration: WIM_HOF_RECOVERY.inhale, stage: 'recovery', ...meta });
    steps.push({ phase: 'hold', duration: WIM_HOF_RECOVERY.hold, stage: 'recovery', ...meta });
    steps.push({ phase: 'exhale', duration: WIM_HOF_RECOVERY.exhale, stage: 'recovery', ...meta });
  }
  return steps;
}
