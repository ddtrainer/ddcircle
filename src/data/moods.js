// 완료 화면의 무드 칩 옵션 (i18n 키와 매칭)
// 순서: 긍정/축하 → 묵묵한 완수 → 어려움 — 사용자가 첫 옵션부터 자연스럽게 훑도록
export const MOODS = [
  { id: 'godlife', key: 'moodGodlife' },
  { id: 'alive', key: 'moodAlive' },
  { id: 'proud', key: 'moodProud' },
  { id: 'joyful', key: 'moodJoyful' },
  { id: 'didIt', key: 'moodDidIt' },
  { id: 'hard', key: 'moodHard' },
  { id: 'blue', key: 'moodBlue' },
  { id: 'anxious', key: 'moodAnxious' },
];

// 공유 대상 — 동심원(concentric) 공개 범위 모델
// private(나) ⊂ circle(나+서클) ⊂ public(나+서클+전 세계)
// public을 고르면 자동으로 서클 피드에도 노출됨 (fetchCircleFeed가 'me' 제외 전부 가져옴)
export const SHARE_TARGETS = [
  { id: 'circle', icon: '💙', labelKey: 'targetCircle', subKey: 'targetCircleSub' },
  { id: 'public', icon: '🌍', labelKey: 'targetGlobal', subKey: 'targetGlobalSub' },
  { id: 'private', icon: '🔒', labelKey: 'targetPrivate', subKey: 'targetPrivateSub' },
];
