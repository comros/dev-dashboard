import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import { mapExperience } from '../lib/mappers.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const analyticsRouter = Router()

analyticsRouter.get('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const experienceId = req.query.experienceId as string | undefined

  let expQuery = ctx.supabase
    .from('experiences')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('name')

  if (experienceId) {
    expQuery = expQuery.eq('id', experienceId)
  }

  const [experiencesRes, snapshotsRes] = await Promise.all([
    expQuery,
    ctx.supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('workspace_id', ctx.workspaceId)
      .order('recorded_at', { ascending: true })
      .limit(500),
  ])

  if (experiencesRes.error) {
    res.status(500).json({ error: experiencesRes.error.message })
    return
  }

  const experiences = (experiencesRes.data ?? []).map((r) =>
    mapExperience(r as Record<string, unknown>)
  )
  const snapshots = snapshotsRes.data ?? []

  const filtered = experienceId
    ? snapshots.filter((s) => s.experience_id === experienceId)
    : snapshots

  res.json({
    experiences,
    snapshots: filtered.map((s) => ({
      id: s.id,
      experienceId: s.experience_id,
      ccu: s.ccu,
      visits: s.visits,
      favorites: s.favorites,
      revenueCents: s.revenue_cents,
      recordedAt: s.recorded_at,
    })),
  })
})

analyticsRouter.post('/snapshot', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { experienceId, ccu, visits, favorites, revenueCents } = req.body as {
    experienceId?: string
    ccu?: number
    visits?: number
    favorites?: number
    revenueCents?: number
  }

  if (!experienceId) {
    res.status(400).json({ error: 'experienceId is required' })
    return
  }

  const { data, error } = await ctx.supabase
    .from('analytics_snapshots')
    .insert({
      workspace_id: ctx.workspaceId,
      experience_id: experienceId,
      ccu: ccu ?? 0,
      visits: visits ?? 0,
      favorites: favorites ?? 0,
      revenue_cents: revenueCents ?? 0,
    })
    .select('*')
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ snapshot: data })
})
