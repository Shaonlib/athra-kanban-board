import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, differenceInDays } from 'date-fns'
import type { Task } from '../../types'
import { PRIORITY_CONFIG } from '../../types'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onTaskClick: (id: string) => void
  isOverlay?: boolean
}

export function TaskCard({ task, onTaskClick, isOverlay }: TaskCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDateInfo = getDueDateInfo(task.due_date, task.status)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${styles.card}
        ${isDragging ? styles.dragging : ''}
        ${isOverlay ? styles.overlay : ''}
      `}
      onClick={() => !isDragging && onTaskClick(task.id)}
      {...attributes}
      {...listeners}
    >
      {/* Priority stripe */}
      <div
        className={styles.priorityStripe}
        style={{ background: PRIORITY_CONFIG[task.priority].color }}
      />

      <div className={styles.body}>
        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className={styles.labels}>
            {task.labels.slice(0, 3).map(l => (
              <span key={l.id} className={styles.label} style={{ '--label-color': l.color } as any}>
                {l.name}
              </span>
            ))}
            {task.labels.length > 3 && (
              <span className={styles.labelMore}>+{task.labels.length - 3}</span>
            )}
          </div>
        )}

        {/* Title */}
        <p className={styles.title}>{task.title}</p>

        {/* Description preview */}
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {/* Priority badge */}
            <span
              className={styles.priorityBadge}
              style={{ color: PRIORITY_CONFIG[task.priority].color }}
              title={`Priority: ${PRIORITY_CONFIG[task.priority].label}`}
            >
              {task.priority === 'high' && '↑'}
              {task.priority === 'normal' && '→'}
              {task.priority === 'low' && '↓'}
            </span>

            {/* Due date */}
            {task.due_date && dueDateInfo && (
              <span className={styles.dueDate} style={{ color: dueDateInfo.color }} title={`Due: ${format(new Date(task.due_date), 'PPP')}`}>
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {dueDateInfo.label}
              </span>
            )}
          </div>

          {/* Assignee avatars */}
          {task.assignees && task.assignees.length > 0 && (
            <div className={styles.avatars}>
              {task.assignees.slice(0, 3).map((m, i) => (
                <div
                  key={m.id}
                  className={styles.avatar}
                  style={{ background: m.color, zIndex: 3 - i, marginLeft: i > 0 ? -6 : 0 }}
                  title={m.name}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className={`${styles.avatar} ${styles.avatarMore}`} style={{ marginLeft: -6 }}>
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getDueDateInfo(due_date?: string, status?: string) {
  if (!due_date) return null
  if (status === 'done') return null

  // Parse as local date to avoid UTC timezone shifting the day
  const [year, month, day] = due_date.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysUntil = differenceInDays(date, today)

  if (daysUntil < 0) {
    return { label: `${Math.abs(daysUntil)}d overdue`, color: 'var(--high)' }
  }
  if (daysUntil === 0) {
    return { label: 'Due today', color: '#f97316' }
  }
  if (daysUntil === 1) {
    return { label: 'Tomorrow', color: '#f59e0b' }
  }
  if (daysUntil <= 3) {
    return { label: `${daysUntil}d left`, color: '#f59e0b' }
  }
  return { label: format(date, 'MMM d'), color: 'var(--text-3)' }
}
