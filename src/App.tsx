import { useEffect, useState } from 'react'
import { supabase, signOut } from './lib/supabase'
import { useAuthStore } from './store/useAuthStore'
import { useBoardStore } from './store/useBoardStore'
import { AuthScreen } from './components/Auth/AuthScreen'
import { Board } from './components/Board/Board'
import { Header } from './components/Toolbar/Header'
import { TaskDetailPanel } from './components/TaskDetail/TaskDetailPanel'
import { CreateTaskModal } from './components/Modals/CreateTaskModal'
import { ManageTeamModal } from './components/Modals/ManageTeamModal'
import { ManageLabelsModal } from './components/Modals/ManageLabelsModal'
import { InviteModal } from './components/Auth/InviteModal'

export type ModalType = 'create-task' | 'manage-team' | 'manage-labels' | 'invite' | null

export default function App() {
  const { authReady, userId, init, clear, workspace, isGuest, isOwner, userName } = useAuthStore()
  const { fetchAll } = useBoardStore()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterLabelId, setFilterLabelId] = useState('')
  const [filterAssigneeId, setFilterAssigneeId] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    init()
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      init()
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (userId) fetchAll()
  }, [userId])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  async function handleSignOut() {
    await signOut()
    clear()
    useBoardStore.setState({ tasks: [], labels: [], members: [] })
  }

  // Loading
  if (!authReady) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
        <div style={{ width:32, height:32, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        <p style={{ color:'var(--text-3)', fontFamily:'var(--font-display)', letterSpacing:'0.05em', fontSize:14 }}>LOADING</p>
      </div>
    )
  }

  // Not logged in — show auth screen
  if (!userId) {
    return <AuthScreen onAuth={() => init()} />
  }

  // Logged in — show board
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <Header
        onCreateTask={() => setActiveModal('create-task')}
        onManageTeam={() => setActiveModal('manage-team')}
        onManageLabels={() => setActiveModal('manage-labels')}
        onInvite={() => setActiveModal('invite')}
        onSignOut={handleSignOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterPriority={filterPriority}
        onFilterPriority={setFilterPriority}
        filterLabelId={filterLabelId}
        onFilterLabel={setFilterLabelId}
        filterAssigneeId={filterAssigneeId}
        onFilterAssignee={setFilterAssigneeId}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        isGuest={isGuest}
        isOwner={isOwner}
        userName={userName}
        workspaceName={workspace?.name}
      />

      <Board
        searchQuery={searchQuery}
        filterPriority={filterPriority}
        filterLabelId={filterLabelId}
        filterAssigneeId={filterAssigneeId}
        onTaskClick={setSelectedTaskId}
      />

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
      {activeModal === 'create-task' && <CreateTaskModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'manage-team' && <ManageTeamModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'manage-labels' && <ManageLabelsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'invite' && workspace && (
        <InviteModal
          workspaceId={workspace.id}
          onClose={() => setActiveModal(null)}
          onInvited={() => fetchAll()}
        />
      )}
    </div>
  )
}
