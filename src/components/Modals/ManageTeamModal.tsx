import { useState } from 'react'
import { useBoardStore } from '../../store/useBoardStore'
import styles from './Modal.module.css'

interface Props { onClose: () => void }

const COLORS = ['#7c6af7','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316','#8b5cf6','#84cc16']

export function ManageTeamModal({ onClose }: Props) {
  const { members, createMember, deleteMember } = useBoardStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name.trim()) return
    setSaving(true)
    await createMember(name.trim(), color)
    setName('')
    setSaving(false)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} animate-scale-in`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Team Members</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Add Member</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={styles.input}
                style={{ flex: 1 }}
                placeholder="Member name"
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

          {members.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Current Team</label>
              <div className={styles.listItems}>
                {members.map(m => (
                  <div key={m.id} className={styles.listItem}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{m.name}</span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteMember(m.id)}
                      title="Remove member"
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
