import { Router } from 'express'
import { createUserClient } from '../lib/supabase.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const meRouter = Router()

meRouter.get('/', async (req: AuthedRequest, res) => {
  const supabase = createUserClient(req.accessToken!)
  const userId = req.user!.id

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name, slug, google_drive_assets_url, google_drive_docs_folder_id, github_repo, discord_invite_url)')
      .eq('user_id', userId),
  ])

  const workspaces =
    memberships?.map((m) => {
      const wsRaw = m.workspaces as unknown
      const ws = (Array.isArray(wsRaw) ? wsRaw[0] : wsRaw) as Record<string, unknown>
      return {
        id: m.workspace_id,
        role: m.role,
        ...ws,
      }
    }) ?? []

  res.json({
    user: {
      id: userId,
      email: req.user!.email,
    },
    profile: profile
      ? {
          id: profile.id,
          displayName: profile.display_name,
          avatarInitials: profile.avatar_initials,
          robloxUsername: profile.roblox_username,
        }
      : null,
    workspaces,
    defaultWorkspaceId: workspaces[0]?.id ?? null,
  })
})
