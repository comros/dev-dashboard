import type { Response } from 'express'
import { createUserClient } from './supabase.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { getWorkspaceId } from '../middleware/auth.js'

export async function resolveWorkspace(req: AuthedRequest, res: Response) {
  const token = req.accessToken!
  const userId = req.user!.id
  const supabase = createUserClient(token)
  const headerWs = getWorkspaceId(req)

  const { data: memberships, error } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, slug)')
    .eq('user_id', userId)

  if (error) {
    res.status(500).json({ error: error.message })
    return null
  }

  if (!memberships?.length) {
    res.status(403).json({ error: 'No workspace found. Complete signup or contact an admin.' })
    return null
  }

  let workspaceId = headerWs
  if (workspaceId && !memberships.some((m) => m.workspace_id === workspaceId)) {
    res.status(403).json({ error: 'Not a member of this workspace' })
    return null
  }

  if (!workspaceId) {
    workspaceId = memberships[0].workspace_id
  }

  const membership = memberships.find((m) => m.workspace_id === workspaceId)!
  const wsRaw = membership.workspaces as unknown
  const ws = (Array.isArray(wsRaw) ? wsRaw[0] : wsRaw) as {
    id: string
    name: string
    slug: string
  }

  return { supabase, workspaceId, workspace: ws, role: membership.role }
}
