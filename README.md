# Athra — Kanban Task Manager

A polished, full-featured Kanban board built with React, TypeScript, and Supabase.

## Features

- Drag-and-drop task management across 4 columns (To Do, In Progress, In Review, Done)
- Guest sessions — anonymous auth with isolated data per user
- Named accounts — sign up with email and create a personal workspace
- Team members — create a team, assign members to tasks, see avatars on cards
- Labels/tags — colour-coded labels with board filtering
- Task comments — threaded comments with timestamps
- Activity log — full history of status changes and edits per task
- Due date indicators — colour-coded urgency (overdue, today, soon)
- Search & filtering — by title, priority, label, and assignee
- Board stats — total tasks, completion rate, overdue count
- Light and dark mode
- RLS-secured — Supabase Row Level Security ensures users only access their own data

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd athra-kanban-board
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Add your Supabase project credentials to `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript + Vite |
| State management | Zustand |
| Drag & drop | @dnd-kit |
| Database & auth | Supabase |
| Hosting | Vercel |
| Date utilities | date-fns |

## Database Schema

See `schema.sql` for the full SQL. Tables:

- `tasks` — core task data with status, priority, due date
- `team_members` — named team members with colour
- `task_assignees` — many-to-many join of tasks and members
- `labels` — user-created colour tags
- `task_labels` — many-to-many join of tasks and labels
- `comments` — per-task threaded comments
- `activity_log` — immutable audit trail of task changes
- `workspaces` — user workspaces created on sign-up
- `workspace_members` — invited members within a workspace

## Security

- All tables have Row Level Security enabled
- Users can only read and write their own data
- Only the Supabase anon key is used in the frontend — the service role key is never exposed
- Environment variables are excluded from version control via `.gitignore`
