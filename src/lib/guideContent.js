// DD 레벨별 인앱 가이드 콘텐츠 (영상/방법/효과)
// 중요: 기존에 작동 중인 운동 SVG 애니메이션·호흡 프리셋은 절대 수정하지 않음.
// Lv.1~3은 기존 호흡/운동 콘텐츠를 그대로 안내하고, Lv.4는 placeholder + 검색 키워드 제공.

// video: null 이면 영상 없이 텍스트 가이드만 노출 (placeholder).
// searchKeywords: 영상이 준비되기 전 사용자가 직접 찾아볼 수 있는 키워드.

export const DEEP_GUIDE = {
  1: {
    title: '🌱 씨앗 · 자연호흡',
    video: null,
    method: ['편하게 앉거나 누워 어깨에 힘을 뺍니다.', '코로 천천히 들이쉬고, 입으로 길게 내쉽니다.', '숫자에 맞춰 호흡 리듬만 따라갑니다.'],
    effect: '긴장 완화와 호흡 인지의 첫걸음. 누구나 부담 없이 시작할 수 있습니다.',
    searchKeywords: [],
  },
  2: {
    title: '🌿 새싹 · 4-7-8 호흡',
    video: null,
    method: ['4초간 코로 들이쉽니다.', '7초간 숨을 멈춥니다.', '8초간 입으로 천천히 내쉽니다.'],
    effect: '부교감신경을 활성화해 수면·불안 완화에 도움을 줍니다.',
    searchKeywords: ['4-7-8 호흡법', '4-7-8 breathing'],
  },
  3: {
    title: '🌳 나무 · 박스 브리딩',
    video: null,
    method: ['4초 들이쉬기 → 4초 멈춤 → 4초 내쉬기 → 4초 멈춤.', '사각형을 그리듯 균일한 리듬을 유지합니다.'],
    effect: '집중력·정서 안정에 효과적이며, 네이비실 등에서 쓰는 멘탈 호흡법입니다.',
    searchKeywords: ['박스 브리딩', 'box breathing'],
  },
  4: {
    title: '🌲 숲 · 위모 호흡 (단축형)',
    video: null,
    method: ['강한 들숨·날숨을 30회 반복 후 숨을 참습니다.', '단축형으로 안전 범위 내에서만 진행합니다.'],
    effect: '에너지·집중 향상. 단, 강도가 높아 안전 안내 확인이 필요합니다.',
    searchKeywords: ['위모 호흡법', 'Wim Hof breathing'],
    safetyNotice: '어지러움·실신 위험이 있어 앉거나 누운 상태에서만 진행하세요. 물·운전·임신 중에는 절대 금지입니다.',
  },
};

export const DASH_GUIDE = {
  1: {
    title: '🌱 씨앗 · 제자리 걷기 / 스트레칭',
    video: null,
    method: ['제자리에서 가볍게 걷거나 팔다리를 스트레칭합니다.', '호흡이 가빠지지 않을 정도로 천천히.'],
    effect: '혈액순환을 돕고 굳은 몸을 부드럽게 풀어줍니다.',
    searchKeywords: [],
  },
  2: {
    title: '🌿 새싹 · 스쿼트 / 팔굽혀펴기',
    video: null,
    method: ['스쿼트: 무릎이 발끝을 넘지 않게 앉았다 일어섭니다.', '팔굽혀펴기: 무릎을 대고 시작해도 좋습니다.'],
    effect: '하체·코어 근력을 키우고 기초 체력을 다집니다.',
    searchKeywords: ['스쿼트 자세', '팔굽혀펴기 자세'],
  },
  3: {
    title: '🌳 나무 · 버피 / 점핑잭',
    video: null,
    method: ['점핑잭: 팔다리를 동시에 벌렸다 모읍니다.', '버피: 앉았다 엎드린 뒤 점프로 일어섭니다.'],
    effect: '전신 유산소 + 근력. 짧은 시간에 심박수를 끌어올립니다.',
    searchKeywords: ['버피 자세', '점핑잭'],
  },
  4: {
    title: '🌲 숲 · HIIT 미니 (20초×3세트)',
    video: null,
    method: ['고강도 20초 + 휴식 10초를 3세트 반복합니다.', '본인 체력에 맞춰 강도를 조절하세요.'],
    effect: '짧고 강하게 — 칼로리 소모와 심폐 지구력 향상에 효과적.',
    searchKeywords: ['HIIT 운동', 'HIIT workout'],
    safetyNotice: '강도가 높습니다. 무리하지 말고 통증·어지러움이 느껴지면 즉시 중단하세요.',
  },
};

export function getGuide(track, level) {
  const map = track === 'deep' ? DEEP_GUIDE : DASH_GUIDE;
  return map[level] || map[1];
}
