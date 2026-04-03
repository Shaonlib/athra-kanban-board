-- ============================================================
-- Athra — Database Schema
-- ============================================================

-- TASKS
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      text not null default 'todo'
    check (status in ('todo','in_progress','in_review','done')),
  priority    text not null default 'normal'
    check (priority in ('low','normal','high')),
  due_date    date,
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now() not null
);

-- TEAM MEMBERS
create table if not exists team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#6366f1',
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- TASK ASSIGNEES (tasks <-> team_members many-to-many)
create table if not exists task_assignees (
  task_id   uuid references tasks(id) on delete cascade not null,
  member_id uuid references team_members(id) on delete cascade not null,
  primary key (task_id, member_id)
);

-- LABELS
create table if not exists labels (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#6366f1',
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- TASK LABELS (tasks <-> labels many-to-many)
create table if not exists task_labels (
  task_id  uuid references tasks(id) on delete cascade not null,
  label_id uuid references labels(id) on delete cascade not null,
  primary key (task_id, label_id)
);

-- COMMENTS
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references tasks(id) on delete cascade not null,
  body       text not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- ACTIVITY LOG
create table if not exists activity_log (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references tasks(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  action     text not null,
  created_at timestamptz default now() not null
);

-- WORKSPACES
create table if not exists workspaces (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- WORKSPACE MEMBERS
create table if not exists workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade,
  email        text not null,
  name         text not null,
  role         text not null default 'member' check (role in ('owner','member')),
  created_at   timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table tasks            enable row level security;
alter table team_members     enable row level security;
alter table task_assignees   enable row level security;
alter table labels           enable row level security;
alter table task_labels      enable row level security;
alter table comments         enable row level security;
alter table activity_log     enable row level security;
alter table workspaces       enable row level security;
alter table workspace_members enable row level security;

-- TASKS
create policy "tasks_select" on tasks for select using (auth.uid() = user_id);
create policy "tasks_insert" on tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update" on tasks for update using (auth.uid() = user_id);
create policy "tasks_delete" on tasks for delete using (auth.uid() = user_id);

-- TEAM MEMBERS
create policy "members_select" on team_members for select using (auth.uid() = user_id);
create policy "members_insert" on team_members for insert with check (auth.uid() = user_id);
create policy "members_update" on team_members for update using (auth.uid() = user_id);
create policy "members_delete" on team_members for delete using (auth.uid() = user_id);

-- TASK ASSIGNEES
create policy "task_assignees_select" on task_assignees for select
  using (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "task_assignees_insert" on task_assignees for insert
  with check (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "task_assignees_delete" on task_assignees for delete
  using (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));

-- LABELS
create policy "labels_select" on labels for select using (auth.uid() = user_id);
create policy "labels_insert" on labels for insert with check (auth.uid() = user_id);
create policy "labels_update" on labels for update using (auth.uid() = user_id);
create policy "labels_delete" on labels for delete using (auth.uid() = user_id);

-- TASK LABELS
create policy "task_labels_select" on task_labels for select
  using (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "task_labels_insert" on task_labels for insert
  with check (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "task_labels_delete" on task_labels for delete
  using (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));

-- COMMENTS
create policy "comments_select" on comments for select
  using (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "comments_insert" on comments for insert
  with check (auth.uid() = user_id and
    exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);

-- ACTIVITY LOG
create policy "activity_select" on activity_log for select
  using (exists (select 1 from tasks where tasks.id = task_id and tasks.user_id = auth.uid()));
create policy "activity_insert" on activity_log for insert
  with check (auth.uid() = user_id);

-- WORKSPACES
create policy "workspaces_select" on workspaces for select using (auth.uid() = owner_id);
create policy "workspaces_insert" on workspaces for insert with check (auth.uid() = owner_id);
create policy "workspaces_update" on workspaces for update using (auth.uid() = owner_id);

-- WORKSPACE MEMBERS
create policy "ws_members_select" on workspace_members for select
  using (exists (select 1 from workspaces where workspaces.id = workspace_id and workspaces.owner_id = auth.uid()));
create policy "ws_members_insert" on workspace_members for insert
  with check (exists (select 1 from workspaces where workspaces.id = workspace_id and workspaces.owner_id = auth.uid()));
create policy "ws_members_delete" on workspace_members for delete
  using (exists (select 1 from workspaces where workspaces.id = workspace_id and workspaces.owner_id = auth.uid()));
