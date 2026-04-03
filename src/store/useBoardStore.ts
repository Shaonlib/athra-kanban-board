import { create } from 'zustand'
import { supabase, getCurrentUserId } from '../lib/supabase'
import type { Task, Label, TeamMember, Comment, ActivityEntry, Status, Priority } from '../types'

interface BoardState {
  tasks: Task[]
  labels: Label[]
  members: TeamMember[]
  loading: boolean
  error: string | null

  fetchAll: (workspaceId?: string) => Promise<void>

  createTask: (data: {
    title: string
    description?: string
    priority: Priority
    due_date?: string
    labelIds?: string[]
    assigneeIds?: string[]
  }) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  moveTask: (id: string, status: Status) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  createLabel: (name: string, color: string) => Promise<void>
  deleteLabel: (id: string) => Promise<void>

  createMember: (name: string, color: string) => Promise<void>
  deleteMember: (id: string) => Promise<void>

  fetchComments: (taskId: string) => Promise<Comment[]>
  addComment: (taskId: string, body: string) => Promise<void>

  fetchActivity: (taskId: string) => Promise<ActivityEntry[]>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  labels: [],
  members: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const [tasksRes, labelsRes, membersRes] = await Promise.all([
        supabase
          .from('tasks')
          .select(`*, task_labels(label:labels(*)), task_assignees(member:team_members(*))`)
          .order('created_at', { ascending: true }),
        supabase.from('labels').select('*').order('name'),
        supabase.from('team_members').select('*').order('name'),
      ])

      if (tasksRes.error) throw tasksRes.error

      const tasks: Task[] = (tasksRes.data ?? []).map((t: any) => ({
        ...t,
        labels: (t.task_labels ?? []).map((tl: any) => tl.label).filter(Boolean),
        assignees: (t.task_assignees ?? []).map((ta: any) => ta.member).filter(Boolean),
      }))

      set({ tasks, labels: labelsRes.data ?? [], members: membersRes.data ?? [], loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  createTask: async ({ title, description, priority, due_date, labelIds = [], assigneeIds = [] }) => {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ title, description, priority, due_date: due_date || null, status: 'todo', user_id: userId })
      .select().single()

    if (error || !task) { set({ error: error?.message }); return }

    if (labelIds.length > 0)
      await supabase.from('task_labels').insert(labelIds.map(lid => ({ task_id: task.id, label_id: lid })))
    if (assigneeIds.length > 0)
      await supabase.from('task_assignees').insert(assigneeIds.map(mid => ({ task_id: task.id, member_id: mid })))

    await logActivity(task.id, userId, 'Created task')
    await get().fetchAll()
  },

  updateTask: async (id, updates) => {
    const userId = await getCurrentUserId()
    const patch: any = {}
    const { title, description, priority, due_date, status } = updates as any
    if (title !== undefined) patch.title = title
    if (description !== undefined) patch.description = description
    if (priority !== undefined) patch.priority = priority
    if (due_date !== undefined) patch.due_date = due_date || null
    if (status !== undefined) patch.status = status

    const { error } = await supabase.from('tasks').update(patch).eq('id', id)
    if (error) { set({ error: error.message }); return }
    if (userId) await logActivity(id, userId, 'Updated task details')
    await get().fetchAll()
  },

  moveTask: async (id, status) => {
    const userId = await getCurrentUserId()
    set(state => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t) }))
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
    if (error) { set({ error: error.message }); await get().fetchAll(); return }
    if (userId) {
      const { COLUMN_CONFIG } = await import('../types')
      await logActivity(id, userId, `Moved to ${COLUMN_CONFIG[status].label}`)
    }
  },

  deleteTask: async (id) => {
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
    await supabase.from('tasks').delete().eq('id', id)
  },

  createLabel: async (name, color) => {
    const userId = await getCurrentUserId()
    if (!userId) return
    const { error } = await supabase.from('labels').insert({ name, color, user_id: userId })
    if (error) { set({ error: error.message }); return }
    await get().fetchAll()
  },

  deleteLabel: async (id) => {
    await supabase.from('labels').delete().eq('id', id)
    await get().fetchAll()
  },

  createMember: async (name, color) => {
    const userId = await getCurrentUserId()
    if (!userId) return
    const { error } = await supabase.from('team_members').insert({ name, color, user_id: userId })
    if (error) { set({ error: error.message }); return }
    await get().fetchAll()
  },

  deleteMember: async (id) => {
    await supabase.from('team_members').delete().eq('id', id)
    await get().fetchAll()
  },

  fetchComments: async (taskId) => {
    const { data, error } = await supabase
      .from('comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true })
    if (error) return []
    return data ?? []
  },

  addComment: async (taskId, body) => {
    const userId = await getCurrentUserId()
    if (!userId) return
    await supabase.from('comments').insert({ task_id: taskId, body, user_id: userId })
  },

  fetchActivity: async (taskId) => {
    const { data, error } = await supabase
      .from('activity_log').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
}))

async function logActivity(taskId: string, userId: string, action: string) {
  await supabase.from('activity_log').insert({ task_id: taskId, user_id: userId, action })
}
