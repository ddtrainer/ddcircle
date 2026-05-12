-- ============================================================
-- DDCircle 초기 스키마 (Phase 1)
-- 실행: Supabase 대시보드 → SQL Editor → 전체 복사·붙여넣기 → Run
-- ============================================================

-- 0) 공통 helper: updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1) profiles — 사용자 프로필 (auth.users에 1:1 매칭)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nickname      text not null check (char_length(nickname) between 1 and 20),
  emoji         text not null default '🌸',
  emoji_bg      text not null default 'linear-gradient(135deg,#fbb040,#f97b9c)',
  invite_code   text unique not null,
  lang          text not null default 'ko' check (lang in ('ko','en')),
  invited_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index profiles_invite_code_idx on public.profiles(invite_code);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2) user_stats — EP/스트릭 (profiles와 1:1)
-- ============================================================
create table public.user_stats (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  total_ep          int not null default 0,
  today_ep          int not null default 0,
  month_ep          int not null default 0,
  streak            int not null default 0,
  last_session_date date,
  empathy_sent      int not null default 0,
  empathy_received  int not null default 0,
  updated_at        timestamptz not null default now()
);
create trigger user_stats_updated_at before update on public.user_stats
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3) posts — 응원나라 게시물
-- ============================================================
create table public.posts (
  id            bigserial primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  message       text not null default '' check (char_length(message) <= 500),
  mood          text,
  target        text not null default 'circle' check (target in ('me','circle','public')),
  exercise_id   text,
  breath_id     text,
  proof_url     text,
  has_proof     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index posts_user_id_created_at_idx on public.posts(user_id, created_at desc);
create index posts_target_created_at_idx on public.posts(target, created_at desc);

-- ============================================================
-- 4) friendships — 친구 관계 (양방향 1행)
-- 항상 (user_a, user_b) 에서 user_a < user_b 로 정렬 저장
-- ============================================================
create table public.friendships (
  user_a        uuid not null references public.profiles(id) on delete cascade,
  user_b        uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create index friendships_user_a_idx on public.friendships(user_a);
create index friendships_user_b_idx on public.friendships(user_b);

-- 두 사용자가 친구인지 확인하는 헬퍼
create or replace function public.are_friends(u1 uuid, u2 uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.friendships
    where (user_a = least(u1, u2) and user_b = greatest(u1, u2))
  );
$$;

-- ============================================================
-- 5) empathies — 공감 (감동/대단/나도)
-- ============================================================
create table public.empathies (
  id            bigserial primary key,
  post_id       bigint not null references public.posts(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  type          text not null check (type in ('sent','great','me')),
  created_at    timestamptz not null default now(),
  unique (post_id, user_id, type)
);
create index empathies_post_id_idx on public.empathies(post_id);

-- ============================================================
-- 6) encouragements — 한 줄 응원
-- ============================================================
create table public.encouragements (
  id            bigserial primary key,
  from_user     uuid not null references public.profiles(id) on delete cascade,
  to_user       uuid not null references public.profiles(id) on delete cascade,
  post_id       bigint references public.posts(id) on delete cascade,
  enc_id        text not null,        -- preset 메시지 ID (i18n 키)
  created_at    timestamptz not null default now()
);
create index encouragements_to_user_idx on public.encouragements(to_user, created_at desc);
create index encouragements_from_user_idx on public.encouragements(from_user, created_at desc);

-- ============================================================
-- 7) challenge_progress — 챌린지 참여/달성
-- ============================================================
create table public.challenge_progress (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  text not null,
  joined_at     timestamptz not null default now(),
  start_streak  int not null default 0,
  claimed_at    timestamptz,
  primary key (user_id, challenge_id)
);

-- ============================================================
-- 8) daily_sessions — 일일 세션 기록 (스트릭 산정용)
-- ============================================================
create table public.daily_sessions (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  session_date  date not null,
  exercise_id   text,
  breath_id     text,
  has_proof     boolean not null default false,
  shared        boolean not null default false,
  earned_ep     int not null default 0,
  created_at    timestamptz not null default now(),
  primary key (user_id, session_date)
);

-- ============================================================
-- 신규 가입자 자동 처리 (auth.users에 row 생성 시 profile + stats 자동 생성)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_invite_code text;
  v_nickname text;
  v_emoji text;
begin
  -- 닉네임/이모지: 카카오 OAuth metadata 또는 기본값
  v_nickname := coalesce(
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'name',
    'DD' || substr(replace(new.id::text, '-', ''), 1, 6)
  );
  v_emoji := coalesce(new.raw_user_meta_data->>'emoji', '🌸');

  -- 고유 invite_code 생성 (충돌 시 재시도)
  loop
    v_invite_code := 'dd-' || substr(md5(random()::text || new.id::text), 1, 8);
    exit when not exists (select 1 from public.profiles where invite_code = v_invite_code);
  end loop;

  insert into public.profiles (id, nickname, emoji, invite_code)
  values (new.id, v_nickname, v_emoji, v_invite_code);

  insert into public.user_stats (user_id) values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.user_stats          enable row level security;
alter table public.posts               enable row level security;
alter table public.friendships         enable row level security;
alter table public.empathies           enable row level security;
alter table public.encouragements      enable row level security;
alter table public.challenge_progress  enable row level security;
alter table public.daily_sessions      enable row level security;

-- profiles
create policy "profiles: anyone can read"
  on public.profiles for select using (true);
create policy "profiles: user updates own"
  on public.profiles for update using (auth.uid() = id);

-- user_stats
create policy "user_stats: self or friend reads"
  on public.user_stats for select using (
    auth.uid() = user_id or public.are_friends(auth.uid(), user_id)
  );
create policy "user_stats: user updates own"
  on public.user_stats for update using (auth.uid() = user_id);
create policy "user_stats: user inserts own"
  on public.user_stats for insert with check (auth.uid() = user_id);

-- posts
create policy "posts: self or public or friend's circle"
  on public.posts for select using (
    auth.uid() = user_id
    or target = 'public'
    or (target = 'circle' and public.are_friends(auth.uid(), user_id))
  );
create policy "posts: user inserts own"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "posts: user deletes own"
  on public.posts for delete using (auth.uid() = user_id);

-- friendships — 양쪽 모두 읽기 가능
create policy "friendships: parties read"
  on public.friendships for select using (
    auth.uid() = user_a or auth.uid() = user_b
  );
create policy "friendships: parties insert"
  on public.friendships for insert with check (
    auth.uid() = user_a or auth.uid() = user_b
  );
create policy "friendships: parties delete"
  on public.friendships for delete using (
    auth.uid() = user_a or auth.uid() = user_b
  );

-- empathies — 게시물 보이면 공감도 보임
create policy "empathies: visible if post visible"
  on public.empathies for select using (
    exists (
      select 1 from public.posts p
      where p.id = empathies.post_id
        and (
          auth.uid() = p.user_id
          or p.target = 'public'
          or (p.target = 'circle' and public.are_friends(auth.uid(), p.user_id))
        )
    )
  );
create policy "empathies: user inserts own"
  on public.empathies for insert with check (auth.uid() = user_id);
create policy "empathies: user deletes own"
  on public.empathies for delete using (auth.uid() = user_id);

-- encouragements — 보낸/받은 본인만
create policy "encouragements: parties read"
  on public.encouragements for select using (
    auth.uid() = from_user or auth.uid() = to_user
  );
create policy "encouragements: user sends own"
  on public.encouragements for insert with check (auth.uid() = from_user);

-- challenge_progress — 본인만
create policy "challenge_progress: self read"
  on public.challenge_progress for select using (auth.uid() = user_id);
create policy "challenge_progress: self write"
  on public.challenge_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- daily_sessions — 본인만
create policy "daily_sessions: self read"
  on public.daily_sessions for select using (auth.uid() = user_id);
create policy "daily_sessions: self write"
  on public.daily_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Storage Bucket — proof 셀카 사진
-- ============================================================
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

create policy "proofs: anyone reads"
  on storage.objects for select
  using (bucket_id = 'proofs');

create policy "proofs: authenticated users upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'proofs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "proofs: user deletes own"
  on storage.objects for delete
  using (
    bucket_id = 'proofs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
