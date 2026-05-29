-- ============================================================
-- DD 레벨 시스템 — Deep/Dash 레벨 + 가이드 열람 기록
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → Run
-- 기존 테이블(profiles, user_stats, daily_sessions 등)은 건드리지 않음.
-- ============================================================

-- 사용자별 현재 Deep/Dash 레벨 (1~4). 닉네임 뱃지·EP 배율 계산에 사용.
create table public.user_levels (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  deep_level  int not null check (deep_level between 1 and 4) default 1,
  dash_level  int not null check (dash_level between 1 and 4) default 1,
  updated_at  timestamptz not null default now()
);

alter table public.user_levels enable row level security;

create policy "user_levels: self read"
  on public.user_levels for select using (auth.uid() = user_id);
create policy "user_levels: self write"
  on public.user_levels for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 가이드 열람 기록 — 어떤 레벨 가이드를 봤는지 (인앱 가이드 분석/온보딩용).
create table public.guide_views (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  track       text not null check (track in ('deep', 'dash')),
  level       int  not null check (level between 1 and 4),
  viewed_at   timestamptz not null default now()
);
create index guide_views_user_idx on public.guide_views(user_id, track, level);

alter table public.guide_views enable row level security;

create policy "guide_views: self read"
  on public.guide_views for select using (auth.uid() = user_id);
create policy "guide_views: self write"
  on public.guide_views for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
