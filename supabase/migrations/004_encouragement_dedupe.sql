-- ============================================================
-- 004: encouragements 중복 방지
-- ============================================================
-- 빠른 더블탭 / 네트워크 재시도 시 같은 사용자가 같은 게시물에 같은
-- 응원을 여러 번 INSERT 하는 케이스를 DB에서 막음.
-- - post_id 가 있는 응원: (from_user, to_user, post_id, enc_id) 조합으로 1회
-- - post_id 가 NULL 인 응원 (친구 그리드의 "안부 보내기" 같은 케이스):
--   같은 날 (from_user, to_user, enc_id) 1회만
--
-- partial unique index 두 개로 두 케이스를 분리 처리.
-- 이미 중복 행이 있다면 마이그레이션이 실패하므로 먼저 cleanup.

-- 1) 게시물별 응원 중복 제거 — 같은 (from, to, post_id) 조합에서
--    가장 최근 1개만 남기고 삭제. 응원 메시지 변경은 enc_id를 UPDATE.
with ranked as (
  select id,
         row_number() over (
           partition by from_user, to_user, post_id
           order by created_at desc, id desc
         ) as rn
  from public.encouragements
  where post_id is not null
)
delete from public.encouragements
where id in (select id from ranked where rn > 1);

-- 2) 게시물 없는 응원 중복 제거 — 같은 (from, to, date) 조합에서
--    가장 최근 1개만 남김 (친구 그리드의 안부/넛지 류 — 하루 1회만 의미 있음)
with ranked as (
  select id,
         row_number() over (
           partition by from_user, to_user, (created_at at time zone 'UTC')::date
           order by created_at desc, id desc
         ) as rn
  from public.encouragements
  where post_id is null
)
delete from public.encouragements
where id in (select id from ranked where rn > 1);

-- 3) 게시물별 응원 — pair-per-post unique (enc_id 변경은 UPDATE)
create unique index if not exists encouragements_post_dedupe_idx
  on public.encouragements (from_user, to_user, post_id)
  where post_id is not null;

-- 4) 게시물 없는 응원 — pair-per-day unique
create unique index if not exists encouragements_daily_dedupe_idx
  on public.encouragements (from_user, to_user, ((created_at at time zone 'UTC')::date))
  where post_id is null;
