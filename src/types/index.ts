export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'normal' | 'high'

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
}

export interface TeamMember {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  due_date?: string
  user_id: string
  created_at: string
  labels?: Label[]
  assignees?: TeamMember[]
}

export interface Comment {
  id: string
  task_id: string
  body: string
  user_id: string
  created_at: string
}

export interface ActivityEntry {
  id: string
  task_id: string
  user_id: string
  action: string
  created_at: string
}

export const COLUMN_CONFIG: Record<Status, { label: string; color: string; accent: string }> = {
  todo:        { label: 'To Do',       color: '#3b82f6', accent: 'rgba(59,130,246,0.12)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', accent: 'rgba(245,158,11,0.12)' },
  in_review:   { label: 'In Review',   color: '#a78bfa', accent: 'rgba(167,139,250,0.12)' },
  done:        { label: 'Done',        color: '#10b981', accent: 'rgba(16,185,129,0.12)' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#10b981' },
  normal: { label: 'Normal', color: '#6366f1' },
  high:   { label: 'High',   color: '#ef4444' },
}

export const COLUMNS: Status[] = ['todo', 'in_progress', 'in_review', 'done']

export interface Workspace {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'member'
  email: string
  name: string
  created_at: string
}

export interface AuthUser {
  id: string
  email?: string
  isGuest: boolean
}
