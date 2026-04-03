import { useState } from 'react'
import { signIn, signUp, ensureGuestSession } from '../../lib/supabase'
import styles from './AuthScreen.module.css'

interface Props {
  onAuth: () => void
}

type Mode = 'login' | 'signup'

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, name)
      } else {
        await signIn(email, password)
      }
      onAuth()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGuest() {
    setLoading(true)
    await ensureGuestSession()
    onAuth()
    setLoading(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>▦</span>
          <span className={styles.brandName}>Athra</span>
        </div>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Work flows<br />beautifully.</h1>
          <p className={styles.heroSub}>A modern Kanban board for teams who care about clarity, speed, and design.</p>
        </div>
        <div className={styles.features}>
          {['Drag-and-drop task management', 'Team collaboration & assignments', 'Labels, priorities & due dates', 'Activity logs & comments'].map(f => (
            <div key={f} className={styles.feature}>
              <span className={styles.featureDot}>✦</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >Sign In</button>
            <button
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => { setMode('signup'); setError('') }}
            >Create Account</button>
          </div>

          <div className={styles.form}>
            {mode === 'signup' && (
              <div className={styles.field}>
                <label className={styles.label}>Your Name</label>
                <input
                  className={styles.input}
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus={mode === 'login'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account & Workspace'}
            </button>

            <div className={styles.divider}><span>or</span></div>

            <button
              className={styles.guestBtn}
              onClick={handleGuest}
              disabled={loading}
            >
              Continue as Guest
              <span className={styles.guestNote}>No account needed · Private board</span>
            </button>
          </div>

          {mode === 'signup' && (
            <p className={styles.fine}>Creating an account sets up your personal workspace. You can invite team members after signing in.</p>
          )}
        </div>
      </div>
    </div>
  )
}
