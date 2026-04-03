import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useBoardStore } from '../../store/useBoardStore'
import { COLUMNS, type Status, type Task } from '../../types'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import styles from './Board.module.css'

interface BoardProps {
  searchQuery: string
  filterPriority: string
  filterLabelId: string
  filterAssigneeId: string
  onTaskClick: (id: string) => void
}

export function Board({ searchQuery, filterPriority, filterLabelId, filterAssigneeId, onTaskClick }: BoardProps) {
  const { tasks, moveTask } = useBoardStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const filteredTasks = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterLabelId && !t.labels?.some(l => l.id === filterLabelId)) return false
    if (filterAssigneeId && !t.assignees?.some(a => a.id === filterAssigneeId)) return false
    return true
  })

  function handleDragStart({ active }: DragStartEvent) {
    const task = tasks.find(t => t.id === active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return

    // over could be the column droppable OR another task card
    // If it's a task card, find which column that task belongs to
    let newStatus = over.data?.current?.columnId as Status | undefined
    if (!newStatus) {
      // over is a task card — find its column from the tasks list
      const overTask = tasks.find(t => t.id === over.id)
      if (overTask) newStatus = overTask.status
    }
    if (!newStatus) return

    const task = tasks.find(t => t.id === active.id)
    if (task && task.status !== newStatus) {
      moveTask(task.id, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map(col => (
          <Column
            key={col}
            columnId={col}
            tasks={filteredTasks.filter(t => t.status === col)}
            allTasks={tasks.filter(t => t.status === col)}
            isDragging={!!activeTask}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask && (
          <TaskCard task={activeTask} onTaskClick={() => {}} isOverlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}
