-- Team members (assignees / doc editors)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text not null,
  role text not null,
  status text not null default 'offline' check (status in ('online', 'away', 'offline')),
  last_active text,
  created_at timestamptz not null default now()
);

-- Tasks (Kanban)
create type public.task_status as enum (
  'backlog', 'todo', 'in-progress', 'review', 'done'
);

create type public.task_priority as enum (
  'low', 'medium', 'high', 'urgent'
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status public.task_status not null default 'backlog',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references public.team_members (id) on delete set null,
  game_id text,
  due_date date,
  tags text[] not null default '{}',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_assignee_idx on public.tasks (assignee_id);

-- Documentation tree (folders + pages)
create table if not exists public.doc_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.doc_nodes (id) on delete cascade,
  title text not null,
  is_folder boolean not null default false,
  content text not null default '',
  icon text,
  is_favorite boolean not null default false,
  sort_order int not null default 0,
  last_edited_by uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists doc_nodes_parent_idx on public.doc_nodes (parent_id);
create index if not exists doc_nodes_favorite_idx on public.doc_nodes (is_favorite) where is_favorite = true;

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists doc_nodes_updated_at on public.doc_nodes;
create trigger doc_nodes_updated_at
  before update on public.doc_nodes
  for each row execute function public.set_updated_at();

-- RLS: block direct client access until auth is wired (backend uses service role)
alter table public.team_members enable row level security;
alter table public.tasks enable row level security;
alter table public.doc_nodes enable row level security;
