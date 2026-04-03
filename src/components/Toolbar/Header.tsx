import { useState } from 'react'
import { useBoardStore } from '../../store/useBoardStore'
import styles from './Header.module.css'

interface HeaderProps {
  onCreateTask: () => void
  onManageTeam: () => void
  onManageLabels: () => void
  onInvite: () => void
  onSignOut: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  filterPriority: string
  onFilterPriority: (p: string) => void
  filterLabelId: string
  onFilterLabel: (id: string) => void
  filterAssigneeId: string
  onFilterAssignee: (id: string) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  isGuest: boolean
  isOwner: boolean
  userName: string | null
  workspaceName?: string
}

export function Header({
  onCreateTask, onManageTeam, onManageLabels, onInvite, onSignOut,
  searchQuery, onSearchChange,
  filterPriority, onFilterPriority,
  filterLabelId, onFilterLabel,
  filterAssigneeId, onFilterAssignee,
  theme, onToggleTheme,
  isGuest, isOwner, userName, workspaceName,
}: HeaderProps) {
  const { tasks, labels, members } = useBoardStore()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    const [y, m, d] = t.due_date.split('-').map(Number)
    return new Date(y, m - 1, d) < new Date(new Date().setHours(0,0,0,0))
  }).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const activeFilterCount = [filterPriority, filterLabelId, filterAssigneeId].filter(Boolean).length

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>▦</span>
            <span className={styles.logoText}>Athra</span>
          </div>
          {workspaceName && (
            <div className={styles.workspaceName}>
              <span className={styles.workspaceSep}>/</span>
              {workspaceName}
            </div>
          )}
        </div>

        <div className={styles.center}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
            {searchQuery && <button className={styles.clearBtn} onClick={() => onSearchChange('')}>✕</button>}
          </div>
        </div>

        <div className={styles.right}>
          <button
            className={`${styles.filterToggle} ${filtersOpen || activeFilterCount > 0 ? styles.filterToggleActive : ''}`}
            onClick={() => setFiltersOpen(v => !v)}
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filters
            {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
          </button>

          <button className={styles.themeBtn} onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className={styles.ghostBtn} onClick={onManageLabels} title="Manage labels">🏷</button>
          <button className={styles.ghostBtn} onClick={onManageTeam} title="Manage team">👥</button>

          {isOwner && !isGuest && (
            <button className={styles.inviteBtn} onClick={onInvite}>
              + Invite
            </button>
          )}

          <button className={styles.createBtn} onClick={onCreateTask}>
            + New Task
          </button>

          {/* User menu */}
          <div className={styles.userMenuWrap}>
            <button
              className={styles.userBtn}
              onClick={() => setUserMenuOpen(v => !v)}
            >
              <div className={styles.userAvatar}>
                {isGuest ? '👤' : (userName?.charAt(0).toUpperCase() ?? '?')}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userNameText}>{isGuest ? 'Guest' : userName}</span>
                <span className={styles.userRole}>{isGuest ? 'Guest Session' : isOwner ? 'Owner' : 'Member'}</span>
              </div>
              <svg viewBox="0 0 10 6" fill="none" width="10">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
            {userMenuOpen && (
              <div className={styles.userMenu}>
                <button className={styles.userMenuItem} onClick={() => { setUserMenuOpen(false); onSignOut() }}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isGuest ? 'Exit Guest Session' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Tasks</span>
          <span className={styles.statValue}>{total}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statLabel}>In Progress</span>
          <span className={styles.statValue} style={{ color: 'var(--in-progress)' }}>{inProgress}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue} style={{ color: 'var(--done)' }}>{done} · {pct}%</span>
        </div>
        {overdue > 0 && <>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statLabel}>Overdue</span>
            <span className={styles.statValue} style={{ color: 'var(--high)' }}>{overdue}</span>
          </div>
        </>}
        <div className={styles.progressBarWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      {filtersOpen && (
        <div className={styles.filterRow}>
          <span className={styles.filterRowLabel}>FILTERS</span>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Priority</span>
            <div className={styles.filterChips}>
              {(['', 'high', 'normal', 'low'] as const).map(p => (
                <button
                  key={p}
                  className={`${styles.filterChip} ${filterPriority === p ? styles.filterChipActive : ''}`}
                  onClick={() => onFilterPriority(p)}
                  style={filterPriority === p && p ? {
                    borderColor: p === 'high' ? 'var(--high)' : p === 'normal' ? 'var(--accent)' : 'var(--low)',
                    color: p === 'high' ? 'var(--high)' : p === 'normal' ? 'var(--accent)' : 'var(--low)',
                    background: p === 'high' ? 'rgba(220,38,38,0.12)' : p === 'normal' ? 'var(--accent-glow)' : 'rgba(10,122,80,0.12)',
                  } : {}}
                >
                  {p === '' ? 'All' : p === 'high' ? '↑ High' : p === 'normal' ? '→ Normal' : '↓ Low'}
                </button>
              ))}
            </div>
          </div>

          {labels.length > 0 && (
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Label</span>
              <div className={styles.filterChips}>
                <button className={`${styles.filterChip} ${!filterLabelId ? styles.filterChipActive : ''}`} onClick={() => onFilterLabel('')}>All</button>
                {labels.map(l => (
                  <button key={l.id}
                    className={`${styles.filterChip} ${filterLabelId === l.id ? styles.filterChipActive : ''}`}
                    style={filterLabelId === l.id ? { borderColor: l.color, color: l.color, background: `${l.color}20` } : {}}
                    onClick={() => onFilterLabel(l.id)}
                  >{l.name}</button>
                ))}
              </div>
            </div>
          )}

          {members.length > 0 && (
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Assignee</span>
              <div className={styles.filterChips}>
                <button className={`${styles.filterChip} ${!filterAssigneeId ? styles.filterChipActive : ''}`} onClick={() => onFilterAssignee('')}>All</button>
                {members.map(m => (
                  <button key={m.id}
                    className={`${styles.filterChip} ${filterAssigneeId === m.id ? styles.filterChipActive : ''}`}
                    style={filterAssigneeId === m.id ? { borderColor: m.color, color: m.color, background: `${m.color}20` } : {}}
                    onClick={() => onFilterAssignee(m.id)}
                  >
                    <span style={{ width:8, height:8, borderRadius:'50%', background:m.color, display:'inline-block' }} />
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <button className={styles.clearFilters} onClick={() => { onFilterPriority(''); onFilterLabel(''); onFilterAssignee('') }}>
              Clear all
            </button>
          )}
        </div>
      )}
    </header>
  )
}
