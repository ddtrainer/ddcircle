// 6단계 생명나무 레벨
export const TREE_LEVELS = [
  { id: 1, key: 'level1', emoji: '🌰', min: 0, max: 200 },
  { id: 2, key: 'level2', emoji: '🌿', min: 200, max: 600 },
  { id: 3, key: 'level3', emoji: '🌳', min: 600, max: 1500 },
  { id: 4, key: 'level4', emoji: '🌸', min: 1500, max: 4000 },
  { id: 5, key: 'level5', emoji: '🍎', min: 4000, max: 10000 },
  { id: 6, key: 'level6', emoji: '🌟', min: 10000, max: 999999 },
];

export function getCurrentLevel(ep) {
  return TREE_LEVELS.find((l) => ep >= l.min && ep < l.max) || TREE_LEVELS[0];
}

export function getNextLevel(ep) {
  const cur = getCurrentLevel(ep);
  return TREE_LEVELS[cur.id] || TREE_LEVELS[TREE_LEVELS.length - 1];
}

// 최근 14일 EP 데이터 (데모용)
export const LAST_14_DAYS = [38, 42, 0, 51, 47, 39, 52, 45, 0, 48, 50, 43, 49, 54];
