-- ============================================================
-- 챌린지 약속 보증 (Stake) — 옵션 C: EP 단계 시뮬레이션 + Phase 2 토큰 배분에 반영
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → Run
-- ============================================================

create table public.challenge_stakes (
  id            bigserial primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  text not null,
  staked_ep     int  not null check (staked_ep >= 0),
  status        text not null check (status in ('active', 'won', 'forfeited')) default 'active',
  start_streak  int  not null default 0,
  declared_at   timestamptz not null default now(),
  resolved_at   timestamptz
);
create index challenge_stakes_user_status_idx
  on public.challenge_stakes(user_id, status);

alter table public.challenge_stakes enable row level security;

create policy "challenge_stakes: self read"
  on public.challenge_stakes for select using (auth.uid() = user_id);
create policy "challenge_stakes: self write"
  on public.challenge_stakes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
