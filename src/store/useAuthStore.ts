import { create } from 'zustand'
import { supabase, getCurrentUser, getWorkspace } from '../lib/supabase'
import type { Workspace } from '../types'

interface AuthState {
  userId: string | null
  userEmail: string | null
  userName: string | null
  isGuest: boolean
  isOwner: boolean
  workspace: Workspace | null
  authReady: boolean

  init: () => Promise<void>
  refresh: () => Promise<void>
  clear: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  userEmail: null,
  userName: null,
  isGuest: false,
  isOwner: false,
  workspace: null,
  authReady: false,

  init: async () => {
    const user = await getCurrentUser()
    if (!user) { set({ authReady: true }); return }

    const isGuest = user.is_anonymous ?? false
    const workspace = await getWorkspace(user.id)

    // Check if user is workspace owner
    const isOwner = workspace?.owner_id === user.id

    set({
      userId: user.id,
      userEmail: user.email ?? null,
      userName: user.user_metadata?.name ?? (isGuest ? 'Guest' : user.email?.split('@')[0] ?? 'User'),
      isGuest,
      isOwner,
      workspace,
      authReady: true,
    })
  },

  refresh: async () => {
    await get().init()
  },

  clear: () => set({
    userId: null,
    userEmail: null,
    userName: null,
    isGuest: false,
    isOwner: false,
    workspace: null,
  }),
}))
