// Dash 3종 — 걷기 / 슬로우 러닝 / 전력질주.
// 모두 가속도계 자동측정(횟수+강도), 이동거리 무관(제자리든 이동이든).
// 종류는 사용자가 컨디션·환경에 따라 자유 선택. 감지 방식은 동일하고 EP는 측정 강도에 비례.
export const DASH_MODES = [
  {
    key: 'walk', emoji: '🚶',
    labelKo: '걷기', labelEn: 'Walk',
    descKo: '가볍게 제자리 또는 이동', descEn: 'Easy · in place or moving',
  },
  {
    key: 'slowrun', emoji: '🏃',
    labelKo: '슬로우 러닝', labelEn: 'Slow Run',
    descKo: '숨이 살짝 찰 정도', descEn: 'Light jog, slightly winded',
  },
  {
    key: 'sprint', emoji: '⚡',
    labelKo: '전력질주', labelEn: 'Sprint',
    descKo: '최대 스피드', descEn: 'Max speed',
  },
  {
    key: 'free', emoji: '🔀',
    labelKo: '자유 종목', labelEn: 'Free Mix',
    descKo: '걷기·러닝·전력질주 혼합', descEn: 'Mix walk · run · sprint',
  },
];

export function getDashMode(key) {
  return DASH_MODES.find((m) => m.key === key) || DASH_MODES[0];
}
