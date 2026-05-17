// 완료 화면의 무드 칩 옵션 (i18n 키와 매칭)
// 순서: 긍정/축하 → 묵묵한 완수 → 어려움 — 사용자가 첫 옵션부터 자연스럽게 훑도록
export const MOODS = [
  { id: 'alive', key: 'moodAlive' },
  { id: 'proud', key: 'moodProud' },
  { id: 'didIt', key: 'moodDidIt' },
  { id: 'hard', key: 'moodHard' },
  { id: 'anxious', key: 'moodAnxious' },
];

// 공유 대상
export const SHARE_TARGETS = [
  { id: 'circle', icon: '💙', labelKey: 'targetCircle' },
  { id: 'public', icon: '🌍', labelKey: 'targetGlobal' },
  { id: 'private', icon: '🔒', labelKey: 'targetPrivate' },
];
