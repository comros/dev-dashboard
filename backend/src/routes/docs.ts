import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import { mapDocNode, mapProfile } from '../lib/mappers.js'
import type { AuthedRequest } from '../middleware/auth.js'
import type { DocTreeFolder, DocTreePage } from '../types.js'

export const docsRouter = Router()

const DOC_SELECT = `
  *,
  last_edited_by_member:profiles!doc_nodes_last_edited_by_fkey (
    id, display_name, avatar_initials, roblox_username
  )
`

docsRouter.get('/tree', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data, error } = await ctx.supabase
    .from('doc_nodes')
    .select(DOC_SELECT)
    .eq('workspace_id', ctx.workspaceId)
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const nodes = (data ?? []).map((row) => mapDocNode(row as Record<string, unknown>))
  const folders = nodes.filter((n) => n.isFolder && n.parentId === null)
  const pages = nodes.filter((n) => !n.isFolder)

  const tree: DocTreeFolder[] = folders.map((folder) => ({
    id: folder.id,
    title: folder.title,
    icon: folder.icon,
    sortOrder: folder.sortOrder,
    children: pages
      .filter((p) => p.parentId === folder.id)
      .map(
        (p): DocTreePage => ({
          id: p.id,
          title: p.title,
          isFavorite: p.isFavorite,
          sortOrder: p.sortOrder,
          lastEditedAt: p.updatedAt,
          editedBy: p.lastEditedBy ?? null,
          googleDriveFileId: p.googleDriveFileId,
        })
      ),
  }))

  const favorites = pages
    .filter((p) => p.isFavorite)
    .map((p) => ({ id: p.id, title: p.title, folderId: p.parentId }))

  const recent = [...pages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
    .map((p) => {
      const folder = folders.find((f) => f.id === p.parentId)
      return {
        id: p.id,
        title: p.title,
        folder: folder?.title ?? '',
        editedBy: p.lastEditedBy ?? null,
        editedAt: p.updatedAt,
      }
    })

  res.json({ tree, favorites, recent })
})

docsRouter.get('/members/list', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data: memberRows } = await ctx.supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', ctx.workspaceId)

  const ids = memberRows?.map((m) => m.user_id) ?? []
  if (ids.length === 0) {
    res.json({ members: [] })
    return
  }

  const { data, error } = await ctx.supabase
    .from('profiles')
    .select('id, display_name, avatar_initials, roblox_username')
    .in('id', ids)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ members: (data ?? []).map((row) => mapProfile(row as Record<string, unknown>)) })
})

docsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data, error } = await ctx.supabase
    .from('doc_nodes')
    .select(DOC_SELECT)
    .eq('id', req.params.id)
    .eq('workspace_id', ctx.workspaceId)
    .eq('is_folder', false)
    .single()

  if (error) {
    res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message })
    return
  }
  res.json({ doc: mapDocNode(data as Record<string, unknown>) })
})

docsRouter.post('/folder', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { title, icon } = req.body as { title?: string; icon?: string | null }
  if (!title?.trim()) {
    res.status(400).json({ error: 'title is required' })
    return
  }

  const { data, error } = await ctx.supabase
    .from('doc_nodes')
    .insert({
      title: title.trim(),
      is_folder: true,
      icon: icon ?? 'book-open',
      workspace_id: ctx.workspaceId,
      created_by: req.user!.id,
      last_edited_by: req.user!.id,
    })
    .select(DOC_SELECT)
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ doc: mapDocNode(data as Record<string, unknown>) })
})

docsRouter.post('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { title, parentId, content = '' } = req.body as {
    title?: string
    parentId?: string | null
    content?: string
  }

  if (!title?.trim()) {
    res.status(400).json({ error: 'title is required' })
    return
  }
  if (!parentId) {
    res.status(400).json({ error: 'parentId (folder) is required' })
    return
  }

  const mdContent =
    content ||
    `# ${title.trim()}\n\nDocument created for your Roblox experience. Add design notes, Luau snippets, and links here.\n`

  const { data, error } = await ctx.supabase
    .from('doc_nodes')
    .insert({
      title: title.trim(),
      parent_id: parentId,
      is_folder: false,
      content: mdContent,
      workspace_id: ctx.workspaceId,
      created_by: req.user!.id,
      last_edited_by: req.user!.id,
    })
    .select(DOC_SELECT)
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ doc: mapDocNode(data as Record<string, unknown>) })
})

docsRouter.patch('/:id', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const body = req.body as Partial<{
    title: string
    content: string
    isFavorite: boolean
    parentId: string | null
  }>

  const updates: Record<string, unknown> = {
    last_edited_by: req.user!.id,
  }
  if (body.title !== undefined) updates.title = body.title
  if (body.content !== undefined) updates.content = body.content
  if (body.isFavorite !== undefined) updates.is_favorite = body.isFavorite
  if (body.parentId !== undefined) updates.parent_id = body.parentId

  const { data, error } = await ctx.supabase
    .from('doc_nodes')
    .update(updates)
    .eq('id', req.params.id)
    .eq('workspace_id', ctx.workspaceId)
    .select(DOC_SELECT)
    .single()

  if (error) {
    res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message })
    return
  }
  res.json({ doc: mapDocNode(data as Record<string, unknown>) })
})

docsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { error } = await ctx.supabase
    .from('doc_nodes')
    .delete()
    .eq('id', req.params.id)
    .eq('workspace_id', ctx.workspaceId)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(204).send()
})
