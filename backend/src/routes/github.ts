import { Router } from 'express'
import { resolveWorkspace } from '../lib/workspace-context.js'
import { supabaseAdmin } from '../lib/supabase.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const githubRouter = Router()

githubRouter.get('/', async (req: AuthedRequest, res) => {
  const ctx = await resolveWorkspace(req, res)
  if (!ctx) return

  const { data: workspace } = await ctx.supabase
    .from('workspaces')
    .select('github_repo')
    .eq('id', ctx.workspaceId)
    .single()

  const repo = workspace?.github_repo
  const token = process.env.GITHUB_TOKEN

  if (repo && token) {
    try {
      const commits = await fetchGithubCommits(repo, token)
      if (commits.length > 0) {
        await supabaseAdmin.from('github_commits').upsert(
          commits.map((c) => ({
            workspace_id: ctx.workspaceId,
            sha: c.sha,
            message: c.message,
            author_name: c.authorName,
            author_avatar: c.authorAvatar,
            branch: c.branch,
            committed_at: c.committedAt,
            additions: c.additions,
            deletions: c.deletions,
            html_url: c.htmlUrl,
          })),
          { onConflict: 'workspace_id,sha' }
        )
      }
    } catch (e) {
      console.warn('[github] fetch failed:', e)
    }
  }

  const { data, error } = await ctx.supabase
    .from('github_commits')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('committed_at', { ascending: false })
    .limit(30)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({
    configured: Boolean(repo && token),
    repo: repo ?? null,
    commits: (data ?? []).map((c) => ({
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
  })
})

async function fetchGithubCommits(repo: string, token: string) {
  const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'dev-dashboard',
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const json = (await res.json()) as Array<{
    sha: string
    commit: { message: string; author: { name: string; date: string } }
    author: { login: string; avatar_url: string } | null
    html_url: string
  }>

  return json.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    authorName: c.commit.author.name || c.author?.login || 'Unknown',
    authorAvatar: c.author?.avatar_url ?? null,
    branch: 'main',
    committedAt: c.commit.author.date,
    additions: 0,
    deletions: 0,
    htmlUrl: c.html_url,
  }))
}
