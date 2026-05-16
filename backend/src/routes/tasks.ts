import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import { mapProfile, mapTask } from '../lib/mappers.js'
import type { AuthedRequest } from '../middleware/auth.js'
import type { TaskPriority, TaskStatus } from '../types.js'

export const tasksRouter = Router()

const TASK_SELECT = `
  *,
  assignee:profiles!tasks_assignee_id_fkey (
    id, display_name, avatar_initials, roblox_username
  ),
  experience:experiences (id, name, roblox_universe_id, status)
`

tasksRouter.get('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data, error } = await ctx.supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('workspace_id', ctx.workspaceId)
    .order('position', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ tasks: (data ?? []).map((row) => mapTask(row as Record<string, unknown>)) })
})

tasksRouter.get('/members', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data: memberRows, error: memErr } = await ctx.supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', ctx.workspaceId)

  if (memErr) {
    res.status(500).json({ error: memErr.message })
    return
  }

  const ids = memberRows?.map((m) => m.user_id) ?? []
  if (ids.length === 0) {
    res.json({ members: [] })
    return
  }

  const { data, error } = await ctx.supabase
    .from('profiles')
    .select('id, display_name, avatar_initials, roblox_username')
    .in('id', ids)
    .order('display_name')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({ members: (data ?? []).map((row) => mapProfile(row as Record<string, unknown>)) })
})

tasksRouter.post('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const {
    title,
    description = '',
    status = 'backlog',
    priority = 'medium',
    assigneeId,
    experienceId,
    dueDate,
    tags = [],
  } = req.body as {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | null
    experienceId?: string | null
    dueDate?: string | null
    tags?: string[]
  }

  if (!title?.trim()) {
    res.status(400).json({ error: 'title is required' })
    return
  }

  const { data, error } = await ctx.supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description,
      status,
      priority,
      assignee_id: assigneeId ?? null,
      experience_id: experienceId ?? null,
      game_id: null,
      due_date: dueDate ?? null,
      tags,
      workspace_id: ctx.workspaceId,
      created_by: req.user!.id,
    })
    .select(TASK_SELECT)
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ task: mapTask(data as Record<string, unknown>) })
})

tasksRouter.patch('/:id', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const body = req.body as Partial<{
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assigneeId: string | null
    experienceId: string | null
    dueDate: string | null
    tags: string[]
    position: number
  }>

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.assigneeId !== undefined) updates.assignee_id = body.assigneeId
  if (body.experienceId !== undefined) updates.experience_id = body.experienceId
  if (body.dueDate !== undefined) updates.due_date = body.dueDate
  if (body.tags !== undefined) updates.tags = body.tags
  if (body.position !== undefined) updates.position = body.position

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'no fields to update' })
    return
  }

  const { data, error } = await ctx.supabase
    .from('tasks')
    .update(updates)
    .eq('id', req.params.id)
    .eq('workspace_id', ctx.workspaceId)
    .select(TASK_SELECT)
    .single()

  if (error) {
    res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message })
    return
  }
  res.json({ task: mapTask(data as Record<string, unknown>) })
})

tasksRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { error } = await ctx.supabase
    .from('tasks')
    .delete()
    .eq('id', req.params.id)
    .eq('workspace_id', ctx.workspaceId)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(204).send()
})
