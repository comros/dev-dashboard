-- Multi-tenant Roblox studio platform (run after 001, or on a fresh project)

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_initials text not null default '?',
  roblox_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Workspaces (your Roblox studio / team)
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  google_drive_assets_url text,
  google_drive_docs_folder_id text,
  github_repo text,
  github_token_encrypted text,
  discord_invite_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_members_user_idx on public.workspace_members (user_id);

-- Roblox experiences (games / universes)
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  roblox_universe_id text,
  roblox_place_id text,
  icon_url text,
  status text not null default 'development' check (
    status in ('live', 'development', 'maintenance', 'archived')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_workspace_idx on public.experiences (workspace_id);

-- Analytics snapshots (record CCU, visits, etc. — manual or future Roblox API)
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  experience_id uuid not null references public.experiences (id) on delete cascade,
  ccu int not null default 0,
  visits bigint not null default 0,
  favorites int not null default 0,
  revenue_cents int not null default 0,
  recorded_at timestamptz not null default now()
);

create index if not exists analytics_experience_time_idx
  on public.analytics_snapshots (experience_id, recorded_at desc);

-- Cached GitHub activity per workspace
create table if not exists public.github_commits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  sha text not null,
  message text not null,
  author_name text not null,
  author_avatar text,
  branch text not null default 'main',
  committed_at timestamptz not null,
  additions int not null default 0,
  deletions int not null default 0,
  html_url text,
  unique (workspace_id, sha)
);

-- Migrate tasks: workspace + experience + creator
alter table public.tasks
  add column if not exists workspace_id uuid references public.workspaces (id) on delete cascade,
  add column if not exists experience_id uuid references public.experiences (id) on delete set null,
  add column if not exists created_by uuid references public.profiles (id) on delete set null;

-- Point assignee at profiles instead of team_members
alter table public.tasks drop constraint if exists tasks_assignee_id_fkey;
alter table public.tasks
  add constraint tasks_assignee_id_fkey
  foreign key (assignee_id) references public.profiles (id) on delete set null;

-- Migrate docs
alter table public.doc_nodes
  add column if not exists workspace_id uuid references public.workspaces (id) on delete cascade,
  add column if not exists created_by uuid references public.profiles (id) on delete set null,
  add column if not exists google_drive_file_id text;

alter table public.doc_nodes drop constraint if exists doc_nodes_last_edited_by_fkey;
alter table public.doc_nodes
  add constraint doc_nodes_last_edited_by_fkey
  foreign key (last_edited_by) references public.profiles (id) on delete set null;

-- Drop legacy team_members (data lives in profiles after signup)
drop table if exists public.team_members cascade;

-- updated_at on new tables
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists workspaces_updated_at on public.workspaces;
create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- New user → profile + default workspace
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws_id uuid;
  base_slug text;
  final_slug text;
  display text;
begin
  display := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    split_part(new.email, '@', 1),
    'Developer'
  );

  insert into public.profiles (id, display_name, avatar_initials, roblox_username)
  values (
    new.id,
    display,
    upper(left(display, 2)),
    new.raw_user_meta_data ->> 'roblox_username'
  );

  base_slug := lower(regexp_replace(display, '[^a-zA-Z0-9]+', '-', 'g'));
  if base_slug = '' or base_slug is null then
    base_slug := 'studio';
  end if;
  final_slug := base_slug || '-' || left(new.id::text, 8);

  insert into public.workspaces (name, slug)
  values (display || '''s Studio', final_slug)
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'owner');

  insert into public.experiences (workspace_id, name, status)
  values (ws_id, 'Main Experience', 'development');

  insert into public.doc_nodes (workspace_id, title, is_folder, icon, sort_order, created_by, last_edited_by)
  values
    (ws_id, 'Game Design', true, 'gamepad-2', 0, new.id, new.id),
    (ws_id, 'Technical', true, 'code', 1, new.id, new.id),
    (ws_id, 'Art & Assets', true, 'palette', 2, new.id, new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS helpers
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

-- Profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm1
      join public.workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
      where wm1.user_id = auth.uid() and wm2.user_id = profiles.id
    )
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid());

-- Workspaces
drop policy if exists workspaces_select on public.workspaces;
create policy workspaces_select on public.workspaces for select
  using (public.is_workspace_member(id));

drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces for update
  using (
    public.is_workspace_member(id)
    and exists (
      select 1 from public.workspace_members
      where workspace_id = id and user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Workspace members
drop policy if exists workspace_members_select on public.workspace_members;
create policy workspace_members_select on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

-- Experiences
drop policy if exists experiences_all on public.experiences;
create policy experiences_all on public.experiences for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Tasks
drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Doc nodes
drop policy if exists doc_nodes_all on public.doc_nodes;
create policy doc_nodes_all on public.doc_nodes for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Analytics
drop policy if exists analytics_all on public.analytics_snapshots;
create policy analytics_all on public.analytics_snapshots for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- GitHub commits cache
drop policy if exists github_commits_all on public.github_commits;
create policy github_commits_all on public.github_commits for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Require workspace on tenant rows (delete orphan rows from pre-auth dev data)
delete from public.tasks where workspace_id is null;
delete from public.doc_nodes where workspace_id is null;
alter table public.tasks alter column workspace_id set not null;
alter table public.doc_nodes alter column workspace_id set not null;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.experiences enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.github_commits enable row level security;
