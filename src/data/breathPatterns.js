// 호흡 프리셋 (들숨-멈춤-날숨-날숨후멈춤, 사이클 수)
export const BREATH_PRESETS = [
  { id: '48',   label: '자연 호흡',         durations: { inhale: 4, hold: 0, exhale: 4, postHold: 0 }, cycles: 6 },
  { id: '478',  label: '4-7-8 이완호흡',   durations: { inhale: 4, hold: 7, exhale: 8, postHold: 0 }, cycles: 6 },
  { id: '4444', label: '4-4-4-4 멘탈호흡', durations: { inhale: 4, hold: 4, exhale: 4, postHold: 4 }, cycles: 6 },
];

// Deep 호흡 4종 — 레벨 잠금 없이 자유 선택(v2.3). labelKey는 i18n(효과 이름).
//   safety=true(윔호프)는 최초 1회 안전 동의 필요.
export const BREATH_MODES = [
  { id: '48',   emoji: '🍃', labelKey: 'breath48',    descKey: 'breath48Desc', settings: 'natural' },
  { id: '478',  emoji: '🌙', labelKey: 'breath478',   descKey: 'breath478Desc',           settings: null },
  { id: '4444', emoji: '🎯', labelKey: 'breath4444',  descKey: 'breath4444Desc',           settings: null },
  { id: 'custom', emoji: '🔥', labelKey: 'breathCustom', descKey: 'breathCustomDesc', settings: 'wimhof', safety: true },
];

// Deep EP 호흡별 배율 (v2.3) — Deep EP = 15(고정) × 배율 × 스트릭. 레벨 배율 폐지.
export const BREATH_MODE_MULTIPLIER = { '48': 1.0, '478': 1.5, '4444': 1.5, custom: 2.0 };
export function breathModeMultiplier(id) {
  return BREATH_MODE_MULTIPLIER[id] ?? 1.0;
}

// 윔호프 안전 동의 플래그 (최초 1회) — localStorage.
const WIMHOF_ACK_KEY = 'ddcircle.wimhof.safetyAck';
export function wimHofSafetyAcked() {
  try { return localStorage.getItem(WIMHOF_ACK_KEY) === '1'; } catch { return false; }
}
export function ackWimHofSafety() {
  try { localStorage.setItem(WIMHOF_ACK_KEY, '1'); } catch { /* ignore */ }
}

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
export const WIM_HOF_RECOVERY_INHALE = 4;
export const DEFAULT_WIM_HOF_RECOVERY = 15; // 회복 호흡 숨 참기 (사용자 조절 가능)
export const DEFAULT_WIM_HOF_FINISH = 8;    // 마무리 날숨 (사용자 조절 가능)
export const WIM_HOF_CYCLES = 2;
export const DEFAULT_WIM_HOF_CYCLES = 1;

// 윔호프 호흡 스크립트 생성
// 구조 고정: 과호흡(power) → 숨 참기(retention) → 회복 호흡(recovery: 들숨+참기) → 마무리 날숨(finish)
// 각 step: { phase, duration, stage, round?, totalRounds? }
//   phase: 'inhale'(팽창) | 'exhale'(수축) | 'hold'(팽창 유지) | 'postHold'(수축 유지) — orb 크기 결정
//   stage: 'power' | 'retention' | 'recovery' | 'finish'
export function buildWimHofScript(
  rounds = DEFAULT_WIM_HOF_ROUNDS,
  cycles = DEFAULT_WIM_HOF_CYCLES,
  retention = DEFAULT_WIM_HOF_RETENTION,
  recoveryHold = DEFAULT_WIM_HOF_RECOVERY,
  finishExhale = DEFAULT_WIM_HOF_FINISH,
) {
  const steps = [];
  for (let c = 1; c <= cycles; c++) {
    const meta = { cycle: c, totalCycles: cycles };
    for (let i = 1; i <= rounds; i++) {
      steps.push({ phase: 'inhale', duration: 1, stage: 'power', round: i, totalRounds: rounds, ...meta });
      steps.push({ phase: 'exhale', duration: 1, stage: 'power', round: i, totalRounds: rounds, ...meta });
    }
    // 숨 참기 = 과호흡 마지막 날숨 후 멈춤(빈 폐) → orb는 최소 수축 유지(postHold)
    steps.push({ phase: 'postHold', duration: retention, stage: 'retention', ...meta });
    steps.push({ phase: 'inhale', duration: WIM_HOF_RECOVERY_INHALE, stage: 'recovery', ...meta });
    steps.push({ phase: 'hold', duration: recoveryHold, stage: 'recovery', ...meta });
    steps.push({ phase: 'exhale', duration: finishExhale, stage: 'finish', ...meta });
  }
  return steps;
}
