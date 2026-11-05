-- PlayScout database schema
-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  instructions text default '',
  cover_url text default '',
  game_url text default '',
  embed_url text default '',
  play_mode text not null default 'external' check (play_mode in ('external','embed','both')),
  tags text[] not null default '{}',
  featured boolean not null default false,
  is_trending boolean not null default false,
  is_new boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_status_idx on public.games(status);
create index if not exists games_category_idx on public.games(category);
create index if not exists games_created_at_idx on public.games(created_at desc);
create index if not exists games_featured_idx on public.games(featured) where featured = true;

create or replace function public.is_playscout_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_playscout_admin() from public;
grant execute on function public.is_playscout_admin() to authenticated;

alter table public.games enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Published games are visible to everyone" on public.games;
create policy "Published games are visible to everyone"
on public.games for select
to anon, authenticated
using (status = 'published' or public.is_playscout_admin());

drop policy if exists "Admins can insert games" on public.games;
create policy "Admins can insert games"
on public.games for insert
to authenticated
with check (public.is_playscout_admin());

drop policy if exists "Admins can update games" on public.games;
create policy "Admins can update games"
on public.games for update
to authenticated
using (public.is_playscout_admin())
with check (public.is_playscout_admin());

drop policy if exists "Admins can delete games" on public.games;
create policy "Admins can delete games"
on public.games for delete
to authenticated
using (public.is_playscout_admin());

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list"
on public.admin_users for select
to authenticated
using (public.is_playscout_admin());

grant select on public.games to anon, authenticated;
grant insert, update, delete on public.games to authenticated;
grant select on public.admin_users to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

-- IMPORTANT: Create your admin user in Supabase Authentication first.
-- Then run the following statement with that user's UUID:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
