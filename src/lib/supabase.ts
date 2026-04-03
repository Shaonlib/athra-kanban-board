import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  })
  if (error) throw error

  // Create workspace for new user
  if (data.user) {
    await supabase.from('workspaces').insert({
      name: `${name}'s Workspace`,
      owner_id: data.user.id,
    })
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function ensureGuestSession(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user.id
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) return null
  // Create a guest workspace
  if (data.user) {
    await supabase.from('workspaces').insert({
      name: 'Guest Workspace',
      owner_id: data.user.id,
    })
  }
  return data.user?.id ?? null
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  return session.user
}

export async function getWorkspace(userId: string) {
  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .single()
  return data
}

export async function inviteMember(workspaceId: string, email: string, name: string) {
  // Check if user exists
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('email', email)
    .single()
  if (existing) throw new Error('This person is already in your workspace.')

  const { error } = await supabase.from('workspace_members').insert({
    workspace_id: workspaceId,
    email,
    name,
    role: 'member',
  })
  if (error) throw error
}
