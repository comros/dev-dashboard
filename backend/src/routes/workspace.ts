import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const workspaceRouter = Router()

workspaceRouter.patch('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  if (ctx.role !== 'owner' && ctx.role !== 'admin') {
    res.status(403).json({ error: 'Admin role required' })
    return
  }

  const body = req.body as Partial<{
    name: string
    googleDriveAssetsUrl: string | null
    googleDriveDocsFolderId: string | null
    githubRepo: string | null
    discordInviteUrl: string | null
  }>

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.googleDriveAssetsUrl !== undefined)
    updates.google_drive_assets_url = body.googleDriveAssetsUrl
  if (body.googleDriveDocsFolderId !== undefined)
    updates.google_drive_docs_folder_id = body.googleDriveDocsFolderId
  if (body.githubRepo !== undefined) updates.github_repo = body.githubRepo
  if (body.discordInviteUrl !== undefined) updates.discord_invite_url = body.discordInviteUrl

  const { data, error } = await ctx.supabase
    .from('workspaces')
    .update(updates)
    .eq('id', ctx.workspaceId)
    .select('*')
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({
    workspace: {
      id: data.id,
      name: data.name,
      slug: data.slug,
      googleDriveAssetsUrl: data.google_drive_assets_url,
      googleDriveDocsFolderId: data.google_drive_docs_folder_id,
      githubRepo: data.github_repo,
      discordInviteUrl: data.discord_invite_url,
    },
  })
})

workspaceRouter.get('/integrations', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data } = await ctx.supabase
    .from('workspaces')
    .select(
      'google_drive_assets_url, google_drive_docs_folder_id, github_repo, discord_invite_url'
    )
    .eq('id', ctx.workspaceId)
    .single()

  const docsFolderId = data?.google_drive_docs_folder_id

  res.json({
    googleDriveAssetsUrl: data?.google_drive_assets_url ?? null,
    googleDriveDocsFolderId: docsFolderId ?? null,
    googleDriveAssetsEmbed: toDriveEmbed(data?.google_drive_assets_url),
    googleDriveDocsOpenUrl: docsFolderId
      ? `https://drive.google.com/drive/folders/${docsFolderId}`
      : null,
    githubRepo: data?.github_repo ?? null,
    discordInviteUrl: data?.discord_invite_url ?? null,
    githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
  })
})

function toDriveEmbed(url: string | null | undefined): string | null {
  if (!url) return null
  const folderMatch = url.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`
  }
  return null
}
