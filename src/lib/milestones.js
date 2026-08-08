// 마일스톤 감지 — 챕터 완성 (7/30/100일) + 표지 진화 (씨앗→숲)
// 저장 직후 사용자의 누적 활동 일수가 임계값에 도달했는지 판정

import { COVER_STAGES, getCoverStage, totalActiveDays, chapterKey, groupByChapter } from './chapters';

// 챕터 완성 단계 (한 달 안에서)
export const CHAPTER_MILESTONES = [
  { days: 7,   id: 'week',  emoji: '✨', titleKey: 'milestoneChapterWeek',  subKey: 'milestoneChapterWeekSub' },
  { days: 30,  id: 'month', emoji: '📖', titleKey: 'milestoneChapterMonth', subKey: 'milestoneChapterMonthSub' },
  { days: 100, id: 'cent',  emoji: '🏆', titleKey: 'milestoneChapterCent',  subKey: 'milestoneChapterCentSub' },
];

// 챕터 내 unique active days
export function chapterActiveDays(posts, key) {
  const grouped = groupByChapter(posts);
  const inChapter = grouped.get(key) || [];
  const days = new Set(inChapter.map((p) => {
    const d = new Date(p.created_at || p.ts);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }));
  return days.size;
}

// 이번 저장이 챕터 마일스톤을 달성시켰는지 — 정확히 임계 일수에 도달한 순간만 true
// 같은 마일스톤을 두 번 알리지 않도록 localStorage 게이트 사용
export function detectChapterMilestone(posts, currentChapterKey, userId) {
  const days = chapterActiveDays(posts, currentChapterKey);
  const reached = CHAPTER_MILESTONES.find((m) => m.days === days);
  if (!reached) return null;
  if (wasNotified(`chapter.${userId}.${currentChapterKey}.${reached.id}`)) return null;
  return { type: 'chapter', chapterKey: currentChapterKey, ...reached, days };
}

// 표지 진화 감지 — 누적 일수가 단계 임계값에 정확히 도달한 순간
export function detectStageEvolution(posts, userId) {
  const days = totalActiveDays(posts);
  const reached = COVER_STAGES.find((s) => s.minDays === days);
  if (!reached) return null;
  if (reached.minDays === 0) return null; // 씨앗(Day 0)은 알림 대상 아님
  if (wasNotified(`stage.${userId}.${reached.id}`)) return null;
  const prev = COVER_STAGES[COVER_STAGES.findIndex((s) => s.id === reached.id) - 1];
  return {
    type: 'stage',
    stage: reached,
    prevStage: prev,
    totalDays: days,
  };
}

// 마일스톤 통합 감지 — 둘 다 동시에 터지면 stage 우선 (더 희귀)
export function detectAnyMilestone(posts, currentChapterKey, userId) {
  return (
    detectStageEvolution(posts, userId) ||
    detectChapterMilestone(posts, currentChapterKey, userId)
  );
}

// localStorage 게이트
const KEY_PREFIX = 'ddcircle.milestone.';

export function wasNotified(token) {
  try { return !!localStorage.getItem(KEY_PREFIX + token); }
  catch { return false; }
}

export function markNotified(token) {
  try { localStorage.setItem(KEY_PREFIX + token, '1'); }
  catch { /* ignore */ }
}

// 알림 후 호출
export function markMilestoneSeen(milestone, userId, currentChapterKey) {
  if (milestone.type === 'chapter') {
    markNotified(`chapter.${userId}.${currentChapterKey}.${milestone.id}`);
  } else if (milestone.type === 'stage') {
    markNotified(`stage.${userId}.${milestone.stage.id}`);
  }
}

// 공유용 텍스트 — Web Share API에 사용
export function shareTextFor(milestone, t, lang = 'ko') {
  if (milestone.type === 'chapter') {
    const label = lang === 'en'
      ? `${milestone.days} days of DD logged — chapter complete on DDCircle 🌿`
      : `DD ${milestone.days}일 챕터 완성 — DDCircle 🌿`;
    return `${label}\nhttps://ddcircle.app`;
  }
  if (milestone.type === 'stage') {
    const name = t(milestone.stage.labelKey);
    const label = lang === 'en'
      ? `${milestone.stage.icon} Cover evolved to ${name} (${milestone.totalDays} days) — DDCircle`
      : `${milestone.stage.icon} 책 표지가 ${name}로 진화했어요 (${milestone.totalDays}일) — DDCircle`;
    return `${label}\nhttps://ddcircle.app`;
  }
  return 'DDCircle\nhttps://ddcircle.app';
}
