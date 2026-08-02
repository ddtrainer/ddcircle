-- ============================================================
-- 전력질주(스프린트) 자동 감지 — daily_sessions 메타 컬럼 추가
-- NULL 허용 / 기본값 있음 → 기존 행·기존 코드에 영향 없음(순수 추가).
-- 롤백: 아래 4개 컬럼 drop.
-- ============================================================
alter table public.daily_sessions
  add column if not exists sprint_count     int,
  add column if not exists sprint_intensity real,
  add column if not exists sprint_verified  boolean,
  add column if not exists is_alternative   boolean not null default false;

-- (참고 롤백)
-- alter table public.daily_sessions
--   drop column if exists sprint_count,
--   drop column if exists sprint_intensity,
--   drop column if exists sprint_verified,
--   drop column if exists is_alternative;
