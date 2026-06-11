// DD 레벨 시스템 — Deep / Dash 각각 Lv.1~4
// 기존 EP 기반 TREE_LEVELS(treeLevels.js)와는 별개 개념. 충돌 없음.
// 개발스펙 v2.0 기준. 기존 호흡/운동 콘텐츠는 절대 수정하지 않음.

// 공통 잠금 해제 조건 (Lv.2~4). Lv.1은 즉시 개방.
//   Lv.2: 3일 연속 + 누적 EP 30
//   Lv.3: 7일 연속 + 누적 EP 100
//   Lv.4: 21일 연속 + 누적 EP 300 (안전 안내 팝업 필수)
const UNLOCK = {
  1: { streak: 0, ep: 0 },
  2: { streak: 3, ep: 30 },
  3: { streak: 7, ep: 100 },
  4: { streak: 21, ep: 300 },
};

// Deep 레벨 — 모두 2분 고정. breathId는 기존 breathPatterns.js 프리셋과 매핑.
// 단계명은 훈련 티어(입문·기본·숙련·전문). emoji는 식물 대신 원형 단계 뱃지(①②③④).
//   ※ 식물 생애주기 은유는 '생명나무 레벨'(treeLevels.js) 전용으로 역할 분리함.
export const DEEP_LEVELS = [
  { level: 1, emoji: '①', name: '입문',  method: '자연호흡',         breathId: '48',   multiplier: 1.0, unlock: UNLOCK[1] },
  { level: 2, emoji: '②', name: '기본',  method: '신경 안정 호흡',     breathId: '478',  multiplier: 1.5, unlock: UNLOCK[2] },
  { level: 3, emoji: '③', name: '숙련',  method: '멘탈 강화 호흡',     breathId: '4444', multiplier: 2.0, unlock: UNLOCK[3] },
  { level: 4, emoji: '④', name: '전문',  method: '면역력 강화 호흡',    breathId: 'custom', multiplier: 3.0, unlock: UNLOCK[4], safetyRequired: true },
];

// Dash 레벨 — 모두 1분 고정. 개발스펙 v2.0 전체 구성표 기준.
//   options: 레벨별 운동 선택지. key=null 은 애니메이션 에셋이 아직 없는 종목(빈 슬롯).
//   exerciseKeys: 실제 재생 가능한(에셋 보유) 키만. 기본 선택값 계산 등에 사용.
export const DASH_LEVELS = [
  { level: 1, emoji: '①', name: '입문',  method: '걷기 / 러닝',
    options: [{ key: 'jog', label: '걷기' }, { key: 'running', label: '러닝' }],
    exerciseKeys: ['jog', 'running'], multiplier: 1.0, unlock: UNLOCK[1] },
  { level: 2, emoji: '②', name: '기본',  method: '스쿼트 / 팔굽혀펴기',
    options: [{ key: 'squat', label: '스쿼트' }, { key: 'pushup', label: '팔굽혀펴기' }],
    exerciseKeys: ['squat', 'pushup'], multiplier: 1.5, unlock: UNLOCK[2] },
  { level: 3, emoji: '③', name: '숙련',  method: '버피 / 점핑잭',
    options: [{ key: 'burpee', label: '버피' }, { key: 'jumping-jack', label: '점핑잭' }],
    exerciseKeys: ['burpee', 'jumping-jack'], multiplier: 2.0, unlock: UNLOCK[3] },
  { level: 4, emoji: '④', name: '전문',  method: 'HIIT 미니',
    options: [{ key: 'hiit', label: 'HIIT 미니' }],
    exerciseKeys: ['hiit'], multiplier: 3.0, unlock: UNLOCK[4], safetyRequired: true },
];

export const MAX_LEVEL = 4;

// 스트릭 부스터 (개발스펙 v2.0) — getMultiplier(ep.js)와는 별개의 DD 레벨용 부스터.
//   Day 1-3   ×1.0
//   Day 4-7   ×1.5
//   Day 8-30  ×2.0
//   Day 31-100 ×3.0
//   Day 101+  ×5.0
export function streakBooster(streak = 0) {
  if (streak >= 101) return 5.0;
  if (streak >= 31) return 3.0;
  if (streak >= 8) return 2.0;
  if (streak >= 4) return 1.5;
  return 1.0;
}

// 스트릭 유예일(grace) — 며칠까지 거른 날을 봐주는지 (티어별 차등).
//   입문(streak<3)·기본(3~6)  → 1일
//   숙련(7~20)               → 2일
//   전문(21+)                → 3일
// 유예일을 초과해 비우면 스트릭이 1로 초기화된다.
// (악용 가드는 의도적으로 없음 — 추후 별도 도입 예정)
export function graceDaysFor(streak = 0) {
  if (streak >= 21) return 3;
  if (streak >= 7) return 2;
  return 1;
}

function levelsFor(track) {
  return track === 'deep' ? DEEP_LEVELS : DASH_LEVELS;
}

export function getLevelDef(track, level) {
  const list = levelsFor(track);
  return list.find((l) => l.level === level) || list[0];
}

export function getMultiplier(track, level) {
  return getLevelDef(track, level).multiplier;
}

// 주어진 스트릭/누적EP로 해제 가능한 최고 레벨 계산.
export function highestUnlockedLevel(track, { streak = 0, totalEp = 0 } = {}) {
  const list = levelsFor(track);
  let best = 1;
  for (const l of list) {
    if (streak >= l.unlock.streak && totalEp >= l.unlock.ep) best = l.level;
  }
  return best;
}

// 현재 레벨에서 다음 레벨로 올라갈 수 있는지 확인.
// 반환: { canLevelUp, nextLevel, next } — 더 올라갈 수 없으면 canLevelUp=false.
export function checkLevelUp(track, currentLevel, { streak = 0, totalEp = 0 } = {}) {
  const nextLevel = currentLevel + 1;
  if (nextLevel > MAX_LEVEL) return { canLevelUp: false, nextLevel: null, next: null };
  const next = getLevelDef(track, nextLevel);
  const canLevelUp = streak >= next.unlock.streak && totalEp >= next.unlock.ep;
  return { canLevelUp, nextLevel, next };
}
