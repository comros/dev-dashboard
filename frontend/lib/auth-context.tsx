'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/utils/supabase/client'
import { api } from '@/lib/api'
import type { Profile, Workspace } from '@/lib/types'

interface AuthState {
  loading: boolean
  profile: Profile | null
  workspaces: Workspace[]
  workspaceId: string | null
  setWorkspaceId: (id: string) => void
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const WORKSPACE_KEY = 'rvault_workspace_id'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setProfile(null)
      setWorkspaces([])
      setWorkspaceIdState(null)
      setLoading(false)
      return
    }

    api.setAccessToken(session.access_token)
    const me = await api.getMe()
    setProfile(me.profile)
    setWorkspaces(me.workspaces)

    const stored = typeof window !== 'undefined' ? localStorage.getItem(WORKSPACE_KEY) : null
    const validStored = me.workspaces.find((w) => w.id === stored)?.id
    const wsId = validStored ?? me.defaultWorkspaceId ?? me.workspaces[0]?.id ?? null
    setWorkspaceIdState(wsId)
    if (wsId) {
      api.setWorkspaceId(wsId)
      localStorage.setItem(WORKSPACE_KEY, wsId)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh().catch(() => setLoading(false))
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh().catch(() => setLoading(false))
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  const setWorkspaceId = useCallback((id: string) => {
    setWorkspaceIdState(id)
    api.setWorkspaceId(id)
    localStorage.setItem(WORKSPACE_KEY, id)
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    api.setAccessToken(null)
    setProfile(null)
    setWorkspaces([])
    setWorkspaceIdState(null)
  }, [])

  const value = useMemo(
    () => ({
      loading,
      profile,
      workspaces,
      workspaceId,
      setWorkspaceId,
      refresh,
      signOut,
    }),
    [loading, profile, workspaces, workspaceId, setWorkspaceId, refresh, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
