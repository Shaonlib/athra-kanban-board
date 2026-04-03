import { useState } from 'react'
import { useBoardStore } from '../../store/useBoardStore'
import styles from './Modal.module.css'

interface Props { onClose: () => void }

const COLORS = ['#7c6af7','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316','#8b5cf6','#84cc16']

export function ManageLabelsModal({ onClose }: Props) {
  const { labels, createLabel, deleteLabel } = useBoardStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name.trim()) return
    setSaving(true)
    await createLabel(name.trim(), color)
    setName('')
    setSaving(false)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} animate-scale-in`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Labels</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Create Label</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={styles.input}
                style={{ flex: 1 }}
                placeholder='e.g. "Bug", "Feature", "Design"'
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              />
              <button
                className={styles.submitBtn}
                onClick={handleAdd}
                disabled={!name.trim() || saving}
              >
                Add
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorRow}>
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {labels.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Existing Labels</label>
              <div className={styles.listItems}>
                {labels.map(l => (
                  <div key={l.id} className={styles.listItem}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
                    <span
                      style={{ flex: 1, fontSize: 13, padding: '2px 8px', borderRadius: 99, background: `${l.color}22`, color: l.color, fontWeight: 600 }}
                    >
                      {l.name}
                    </span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteLabel(l.id)}
                      title="Delete label"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.submitBtn} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
