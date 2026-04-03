import { useState } from 'react'
import { useBoardStore } from '../../store/useBoardStore'
import type { Priority } from '../../types'
import { PRIORITY_CONFIG } from '../../types'
import styles from './Modal.module.css'

interface Props { onClose: () => void }

export function CreateTaskModal({ onClose }: Props) {
  const { createTask, labels, members } = useBoardStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  function toggleLabel(id: string) {
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleMember(id: string) {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSubmit() {
    if (!title.trim()) return
    setSubmitting(true)
    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
      labelIds: selectedLabels,
      assigneeIds: selectedMembers,
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} animate-scale-in`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New Task</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Title <span style={{ color: 'var(--high)' }}>*</span></label>
            <input
              className={styles.input}
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Add more context…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Priority</label>
              <div className={styles.priorityGroup}>
                {(['low', 'normal', 'high'] as Priority[]).map(p => (
                  <button
                    key={p}
                    className={`${styles.priorityBtn} ${priority === p ? styles.priorityBtnActive : ''}`}
                    style={priority === p ? { borderColor: PRIORITY_CONFIG[p].color, color: PRIORITY_CONFIG[p].color, background: `${PRIORITY_CONFIG[p].color}18` } : {}}
                    onClick={() => setPriority(p)}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {labels.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Labels</label>
              <div className={styles.chipRow}>
                {labels.map(l => (
                  <button
                    key={l.id}
                    className={`${styles.chip} ${selectedLabels.includes(l.id) ? styles.chipActive : ''}`}
                    style={selectedLabels.includes(l.id) ? { borderColor: l.color, color: l.color, background: `${l.color}22` } : {}}
                    onClick={() => toggleLabel(l.id)}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {members.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Assignees</label>
              <div className={styles.chipRow}>
                {members.map(m => (
                  <button
                    key={m.id}
                    className={`${styles.chip} ${selectedMembers.includes(m.id) ? styles.chipActive : ''}`}
                    style={selectedMembers.includes(m.id) ? { borderColor: m.color, color: m.color, background: `${m.color}22` } : {}}
                    onClick={() => toggleMember(m.id)}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
          >
            {submitting ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
