import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import { mapExperience, mapTask } from '../lib/mappers.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const dashboardRouter = Router()

dashboardRouter.get('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const [experiencesRes, tasksRes, commitsRes, analyticsRes] = await Promise.all([
    ctx.supabase
      .from('experiences')
      .select('*')
      .eq('workspace_id', ctx.workspaceId)
      .order('name'),
    ctx.supabase
      .from('tasks')
      .select(
        `*, assignee:profiles!tasks_assignee_id_fkey (id, display_name, avatar_initials, roblox_username),
         experience:experiences (id, name)`
      )
      .eq('workspace_id', ctx.workspaceId)
      .neq('status', 'done')
      .order('updated_at', { ascending: false })
      .limit(8),
    ctx.supabase
      .from('github_commits')
      .select('*')
      .eq('workspace_id', ctx.workspaceId)
      .order('committed_at', { ascending: false })
      .limit(6),
    ctx.supabase
      .from('analytics_snapshots')
      .select('*, experiences(id, name)')
      .eq('workspace_id', ctx.workspaceId)
      .order('recorded_at', { ascending: false })
      .limit(50),
  ])

  const experiences = (experiencesRes.data ?? []).map((r) =>
    mapExperience(r as Record<string, unknown>)
  )
  const tasks = (tasksRes.data ?? []).map((r) => mapTask(r as Record<string, unknown>))
  const commits = commitsRes.data ?? []
  const snapshots = analyticsRes.data ?? []

  const latestByExperience = new Map<string, (typeof snapshots)[0]>()
  for (const s of snapshots) {
    if (!latestByExperience.has(s.experience_id)) {
      latestByExperience.set(s.experience_id, s)
    }
  }

  let totalCcu = 0
  let totalVisits = 0
  let totalRevenue = 0
  for (const s of latestByExperience.values()) {
    totalCcu += s.ccu ?? 0
    totalVisits += Number(s.visits ?? 0)
    totalRevenue += s.revenue_cents ?? 0
  }

  res.json({
    stats: {
      totalCcu,
      totalVisits,
      totalRevenueCents: totalRevenue,
      activeTasks: tasks.filter((t) => t.status === 'in-progress').length,
      experienceCount: experiences.length,
    },
    experiences,
    recentTasks: tasks.slice(0, 5),
    recentCommits: commits.map((c) => ({
      id: c.id,
      sha: c.sha,
      message: c.message,
      authorName: c.author_name,
      authorAvatar: c.author_avatar,
      branch: c.branch,
      committedAt: c.committed_at,
      additions: c.additions,
      deletions: c.deletions,
      htmlUrl: c.html_url,
    })),
    chartData: buildChartFromSnapshots(snapshots),
  })
})

function buildChartFromSnapshots(
  snapshots: { recorded_at: string; ccu: number; revenue_cents: number }[]
) {
  const byDay = new Map<string, { ccu: number; revenue: number; count: number }>()
  for (const s of snapshots) {
    const day = s.recorded_at.slice(0, 10)
    const cur = byDay.get(day) ?? { ccu: 0, revenue: 0, count: 0 }
    cur.ccu += s.ccu
    cur.revenue += s.revenue_cents
    cur.count += 1
    byDay.set(day, cur)
  }
  const sorted = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14)
  return {
    ccuHistory: sorted.map(([date, v]) => ({
      date,
      value: Math.round(v.ccu / Math.max(v.count, 1)),
    })),
    revenueHistory: sorted.map(([date, v]) => ({
      date,
      value: Math.round(v.revenue / Math.max(v.count, 1)),
    })),
  }
}
