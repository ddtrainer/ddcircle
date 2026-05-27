// 챕터(=월별 책) 시스템 + 표지 진화 단계
// 향후 Pi Apps에서 각 챕터를 NFT로 mint할 때 chapterKey가 token 메타데이터 키가 됨
// 지금은 client-side에서 posts를 그룹핑해 책으로 시각화하는 용도

// 표지 진화 5단계 — 누적 활동 일수로 결정
// 엘프대륙 NFT 등급 매핑: Common → Uncommon → Rare → Epic → Legendary
export const COVER_STAGES = [
  { id: 'seed',    minDays: 0,   icon: '🌰', label: '씨앗',      labelEn: 'Seed',    grade: 'Common',    color: '#a98564' },
  { id: 'sprout',  minDays: 8,   icon: '🌱', label: '새싹',      labelEn: 'Sprout',  grade: 'Uncommon',  color: '#9bc88a' },
  { id: 'sapling', minDays: 31,  icon: '🌿', label: '어린 나무',  labelEn: 'Sapling', grade: 'Rare',      color: '#5fa86b' },
  { id: 'tree',    minDays: 101, icon: '🌳', label: '나무',      labelEn: 'Tree',    grade: 'Epic',      color: '#3b7d4f' },
  { id: 'forest',  minDays: 366, icon: '🌲', label: '숲',        labelEn: 'Forest',  grade: 'Legendary', color: '#1f5d3a' },
];

// 누적 일수 → 현재 단계
export function getCoverStage(totalDays = 0) {
  const sorted = [...COVER_STAGES].sort((a, b) => b.minDays - a.minDays);
  return sorted.find((s) => totalDays >= s.minDays) || COVER_STAGES[0];
}

// 다음 단계 (없으면 null = 최고 단계)
export function getNextStage(totalDays = 0) {
  const current = getCoverStage(totalDays);
  const idx = COVER_STAGES.findIndex((s) => s.id === current.id);
  return COVER_STAGES[idx + 1] || null;
}

// 날짜 → 챕터 키 (YYYY-MM 형식, 향후 NFT 메타데이터에 그대로 사용)
export function chapterKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// 챕터 키 → 사람이 읽는 라벨
export function chapterLabel(key, lang = 'ko') {
  const [y, m] = key.split('-');
  if (lang === 'en') {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${names[parseInt(m, 10) - 1]} ${y}`;
  }
  return `${y}년 ${parseInt(m, 10)}월`;
}

// posts 배열 → 챕터별 그룹 (Map<chapterKey, posts[]>)
// 각 챕터 내에서는 날짜 오름차순으로 정렬 (페이지 순서)
export function groupByChapter(posts = []) {
  const map = new Map();
  posts.forEach((p) => {
    const key = chapterKey(p.created_at || p.ts);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  });
  // 각 챕터 내부 — 페이지 1번부터 시작하도록 시간순 오름차순
  for (const [k, list] of map) {
    list.sort((a, b) => {
      const ta = new Date(a.created_at || a.ts).getTime();
      const tb = new Date(b.created_at || b.ts).getTime();
      return ta - tb;
    });
    // 페이지 번호 부여 (향후 page_no 컬럼으로 이전)
    list.forEach((p, i) => { p._pageNo = i + 1; });
  }
  return map;
}

// 챕터별 책 메타 — 책장에 표시할 카드 정보
export function chapterBookMeta(key, posts = []) {
  const days = new Set(posts.map((p) => {
    const d = new Date(p.created_at || p.ts);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  })).size;
  const stage = getCoverStage(days);
  return {
    key,
    pageCount: posts.length,
    activeDays: days,
    stage,
    firstPage: posts[0] || null,
    lastPage: posts[posts.length - 1] || null,
  };
}

// 전체 누적 활동 일수 (모든 챕터에 걸친 unique 날짜)
export function totalActiveDays(posts = []) {
  const days = new Set(posts.map((p) => {
    const d = new Date(p.created_at || p.ts);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }));
  return days.size;
}

// 페이지 고유 번호 — 향후 NFT token ID로 매핑될 형식
// 예: PoL-2026-11-08 (Proof of Life - 2026년 11월 8번째 페이지)
export function pageId(post) {
  const key = chapterKey(post.created_at || post.ts);
  const no = String(post._pageNo || 1).padStart(2, '0');
  return `PoL-${key}-${no}`;
}
