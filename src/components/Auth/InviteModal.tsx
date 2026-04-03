import { useState } from 'react'
import { inviteMember } from '../../lib/supabase'
import styles from '../Modals/Modal.module.css'
import localStyles from './InviteModal.module.css'

interface Props {
  workspaceId: string
  onClose: () => void
  onInvited: () => void
}

export function InviteModal({ workspaceId, onClose, onInvited }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleInvite() {
    if (!email.trim() || !name.trim()) { setError('Please fill in both fields.'); return }
    setSaving(true)
    setError('')
    try {
      await inviteMember(workspaceId, email.trim(), name.trim())
      setSuccess(`${name} has been added to your workspace!`)
      setEmail('')
      setName('')
      onInvited()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} animate-scale-in`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Invite to Workspace</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.form}>
          <p className={localStyles.info}>
            Add a team member to your workspace. They'll need to create an Athra account with this email to access the board.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              placeholder="Jane Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
          </div>

          {error && <p className={localStyles.error}>{error}</p>}
          {success && <p className={localStyles.success}>{success}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Done</button>
          <button
            className={styles.submitBtn}
            onClick={handleInvite}
            disabled={!email.trim() || !name.trim() || saving}
          >
            {saving ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}
