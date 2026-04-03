import { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { useBoardStore } from '../../store/useBoardStore'
import type { Comment, ActivityEntry, Priority, Status } from '../../types'
import { COLUMN_CONFIG, PRIORITY_CONFIG, COLUMNS } from '../../types'
import styles from './TaskDetailPanel.module.css'

interface Props {
  taskId: string
  onClose: () => void
}

export function TaskDetailPanel({ taskId, onClose }: Props) {
  const { tasks, labels, members, updateTask, deleteTask, addComment, fetchComments, fetchActivity } = useBoardStore()
  const task = tasks.find(t => t.id === taskId)

  const [comments, setComments] = useState<Comment[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [commentText, setCommentText] = useState('')
  const [tab, setTab] = useState<'comments' | 'activity'>('comments')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const commentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!task) return
    setEditTitle(task.title)
    setEditDesc(task.description ?? '')
    fetchComments(task.id).then(setComments)
    fetchActivity(task.id).then(setActivity)
  }, [taskId])

  if (!task) return null

  async function handleSaveEdit() {
    await updateTask(task!.id, { title: editTitle, description: editDesc })
    setEditing(false)
  }

  async function handlePostComment() {
    if (!commentText.trim()) return
    await addComment(task!.id, commentText.trim())
    setCommentText('')
    const updated = await fetchComments(task!.id)
    setComments(updated)
    const updatedActivity = await fetchActivity(task!.id)
    setActivity(updatedActivity)
  }

  async function handleStatusChange(status: Status) {
    await updateTask(task!.id, { status })
    const updatedActivity = await fetchActivity(task!.id)
    setActivity(updatedActivity)
  }

  async function handlePriorityChange(priority: Priority) {
    await updateTask(task!.id, { priority })
  }

  async function handleDeleteTask() {
    if (!confirm('Delete this task? This cannot be undone.')) return
    await deleteTask(task!.id)
    onClose()
  }

  async function handleToggleLabel(labelId: string) {
    const hasLabel = task!.labels?.some(l => l.id === labelId)
    const newLabelIds = hasLabel
      ? (task!.labels?.filter(l => l.id !== labelId).map(l => l.id) ?? [])
      : [...(task!.labels?.map(l => l.id) ?? []), labelId]

    // Update via supabase directly
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('task_labels').delete().eq('task_id', task!.id)
    if (newLabelIds.length > 0) {
      await supabase.from('task_labels').insert(newLabelIds.map((lid: string) => ({ task_id: task!.id, label_id: lid })))
    }
    await useBoardStore.getState().fetchAll()
  }

  async function handleToggleAssignee(memberId: string) {
    const hasAssignee = task!.assignees?.some(m => m.id === memberId)
    const newIds = hasAssignee
      ? (task!.assignees?.filter(m => m.id !== memberId).map(m => m.id) ?? [])
      : [...(task!.assignees?.map(m => m.id) ?? []), memberId]

    const { supabase } = await import('../../lib/supabase')
    await supabase.from('task_assignees').delete().eq('task_id', task!.id)
    if (newIds.length > 0) {
      await supabase.from('task_assignees').insert(newIds.map((mid: string) => ({ task_id: task!.id, member_id: mid })))
    }
    await useBoardStore.getState().fetchAll()
  }

  const colConfig = COLUMN_CONFIG[task.status]
  const prioConfig = PRIORITY_CONFIG[task.priority]

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.panel} animate-slide-in`}>
        {/* Panel header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.statusChip} style={{ color: colConfig.color, background: colConfig.accent }}>
              {colConfig.label}
            </span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={handleDeleteTask} title="Delete task">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.iconBtn} onClick={onClose} title="Close">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Title */}
          {editing ? (
            <div className={styles.editBlock}>
              <input
                className={styles.editTitle}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit() }}
              />
              <textarea
                className={styles.editDesc}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Add a description…"
                rows={3}
              />
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSaveEdit}>Save</button>
                <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.titleBlock} onClick={() => setEditing(true)}>
              <h2 className={styles.title}>{task.title}</h2>
              {task.description && <p className={styles.description}>{task.description}</p>}
              {!task.description && <p className={styles.addDesc}>+ Add description</p>}
            </div>
          )}

          {/* Properties grid */}
          <div className={styles.props}>
            <PropRow label="Status">
              <select
                className={styles.propSelect}
                value={task.status}
                onChange={e => handleStatusChange(e.target.value as Status)}
              >
                {COLUMNS.map(col => (
                  <option key={col} value={col}>{COLUMN_CONFIG[col].label}</option>
                ))}
              </select>
            </PropRow>

            <PropRow label="Priority">
              <select
                className={styles.propSelect}
                style={{ color: prioConfig.color }}
                value={task.priority}
                onChange={e => handlePriorityChange(e.target.value as Priority)}
              >
                <option value="low">↓ Low</option>
                <option value="normal">→ Normal</option>
                <option value="high">↑ High</option>
              </select>
            </PropRow>

            <PropRow label="Due Date">
              <input
                type="date"
                className={styles.propInput}
                value={task.due_date ?? ''}
                onChange={e => updateTask(task.id, { due_date: e.target.value })}
              />
            </PropRow>

            {members.length > 0 && (
              <PropRow label="Assignees">
                <div className={styles.chipGroup}>
                  {members.map(m => {
                    const active = task.assignees?.some(a => a.id === m.id)
                    return (
                      <button
                        key={m.id}
                        className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                        style={active ? { borderColor: m.color, color: m.color, background: `${m.color}22` } : {}}
                        onClick={() => handleToggleAssignee(m.id)}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                        {m.name}
                      </button>
                    )
                  })}
                </div>
              </PropRow>
            )}

            {labels.length > 0 && (
              <PropRow label="Labels">
                <div className={styles.chipGroup}>
                  {labels.map(l => {
                    const active = task.labels?.some(tl => tl.id === l.id)
                    return (
                      <button
                        key={l.id}
                        className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                        style={active ? { borderColor: l.color, color: l.color, background: `${l.color}22` } : {}}
                        onClick={() => handleToggleLabel(l.id)}
                      >
                        {l.name}
                      </button>
                    )
                  })}
                </div>
              </PropRow>
            )}
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'comments' ? styles.tabActive : ''}`}
              onClick={() => setTab('comments')}
            >
              Comments {comments.length > 0 && <span className={styles.tabBadge}>{comments.length}</span>}
            </button>
            <button
              className={`${styles.tab} ${tab === 'activity' ? styles.tabActive : ''}`}
              onClick={() => setTab('activity')}
            >
              Activity {activity.length > 0 && <span className={styles.tabBadge}>{activity.length}</span>}
            </button>
          </div>

          {/* Comments */}
          {tab === 'comments' && (
            <div className={styles.commentSection}>
              <div className={styles.commentList}>
                {comments.length === 0 && (
                  <p className={styles.emptyTabText}>No comments yet. Be the first!</p>
                )}
                {comments.map(c => (
                  <div key={c.id} className={styles.comment}>
                    <div className={styles.commentAvatar}>G</div>
                    <div className={styles.commentBody}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>You</span>
                        <span className={styles.commentTime}>{format(new Date(c.created_at), 'MMM d · h:mm a')}</span>
                      </div>
                      <p className={styles.commentText}>{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.commentInput}>
                <textarea
                  ref={commentRef}
                  className={styles.commentTextarea}
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={2}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostComment() }}
                />
                <button
                  className={styles.postBtn}
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Activity */}
          {tab === 'activity' && (
            <div className={styles.activityList}>
              {activity.length === 0 && (
                <p className={styles.emptyTabText}>No activity yet.</p>
              )}
              {activity.map(a => (
                <div key={a.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <span className={styles.activityAction}>{a.action}</span>
                    <span className={styles.activityTime}>{format(new Date(a.created_at), 'MMM d · h:mm a')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-3)', width: 72, flexShrink: 0, paddingTop: 7, fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
