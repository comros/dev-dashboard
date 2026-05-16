import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import { mapExperience } from '../lib/mappers.js'
import type { AuthedRequest } from '../middleware/auth.js'
import type { ExperienceStatus } from '../types.js'

export const experiencesRouter = Router()

experiencesRouter.get('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data, error } = await ctx.supabase
    .from('experiences')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('name')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({
    experiences: (data ?? []).map((row) => mapExperience(row as Record<string, unknown>)),
  })
})

experiencesRouter.post('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { name, robloxUniverseId, robloxPlaceId, status = 'development', iconUrl } =
    req.body as {
      name?: string
      robloxUniverseId?: string
      robloxPlaceId?: string
      status?: ExperienceStatus
      iconUrl?: string
    }

  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const { data, error } = await ctx.supabase
    .from('experiences')
    .insert({
      workspace_id: ctx.workspaceId,
      name: name.trim(),
      roblox_universe_id: robloxUniverseId ?? null,
      roblox_place_id: robloxPlaceId ?? null,
      status,
      icon_url: iconUrl ?? null,
    })
    .select('*')
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ experience: mapExperience(data as Record<string, unknown>) })
})
