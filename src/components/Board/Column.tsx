import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { COLUMN_CONFIG, type Status, type Task } from '../../types'
import { TaskCard } from './TaskCard'
import styles from './Column.module.css'

interface ColumnProps {
  columnId: Status
  tasks: Task[]
  allTasks: Task[]
  isDragging: boolean
  onTaskClick: (id: string) => void
}

export function Column({ columnId, tasks, allTasks, isDragging, onTaskClick }: ColumnProps) {
  const config = COLUMN_CONFIG[columnId]

  const { setNodeRef, isOver } = useDroppable({
    id: `col-${columnId}`,
    data: { columnId },
  })

  return (
    <div className={`${styles.column} ${isOver ? styles.isOver : ''} ${isDragging ? styles.dragging : ''}`}>
      <div className={styles.header} style={{ '--col-color': config.color } as any}>
        <div className={styles.headerLeft}>
          <div className={styles.dot} style={{ background: config.color }} />
          <span className={styles.title}>{config.label}</span>
          <span className={styles.count}>{allTasks.length}</span>
        </div>
      </div>

      <div
        className={styles.taskList}
        ref={setNodeRef}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isDragging && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {columnId === 'todo' && '📋'}
              {columnId === 'in_progress' && '⚡'}
              {columnId === 'in_review' && '🔍'}
              {columnId === 'done' && '✅'}
            </div>
            <p className={styles.emptyText}>No tasks here</p>
            <p className={styles.emptySubtext}>Drop tasks here or create a new one</p>
          </div>
        )}

        {tasks.length === 0 && isDragging && (
          <div className={styles.dropTarget}>
            <span>Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}
