-- ============================================================
-- Phase 6 — Realtime 활성화
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → Run
-- ============================================================

-- posts / empathies / encouragements를 Realtime publication에 추가
-- → 클라이언트가 postgres_changes 이벤트를 받을 수 있게 됨

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.empathies;
alter publication supabase_realtime add table public.encouragements;

-- 검증 (실행 후 publication에 추가된 테이블 목록 확인)
-- select tablename from pg_publication_tables where pubname = 'supabase_realtime';
