'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GitBranch, GitCommit, Loader2, RefreshCw, ExternalLink,
  Plus, Minus, User, TrendingUp,
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import type { GithubCommit } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Author stats derived from commits ───────────────────────────────────────
interface AuthorStats {
  name: string
  commits: number
  additions: number
  deletions: number
}

function buildAuthorStats(commits: GithubCommit[]): AuthorStats[] {
  const map: Record<string, AuthorStats> = {}
  for (const c of commits) {
    if (!map[c.authorName]) {
      map[c.authorName] = { name: c.authorName, commits: 0, additions: 0, deletions: 0 }
    }
    map[c.authorName].commits++
    map[c.authorName].additions += c.additions
    map[c.authorName].deletions += c.deletions
  }
  return Object.values(map).sort((a, b) => b.commits - a.commits)
}

// ─── Commit card ──────────────────────────────────────────────────────────────
function CommitRow({ c }: { c: GithubCommit }) {
  const sha = c.sha.slice(0, 7)
  const hasChanges = c.additions > 0 || c.deletions > 0
  // Treat first line of message as subject, rest as body
  const [subject, ...rest] = c.message.split('\n')
  const body = rest.join('\n').trim()

  return (
    <li className="flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-0 group">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
          <GitCommit className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm leading-snug">{subject}</p>
          {body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{body}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {c.authorName}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              <GitBranch className="w-2.5 h-2.5 mr-1" />
              {c.branch}
            </Badge>
            <span>{formatRelativeTime(c.committedAt)}</span>
            <code className="font-mono text-[10px] text-muted-foreground/60">{sha}</code>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {hasChanges && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {c.additions > 0 && (
              <span className="text-success flex items-center gap-0.5">
                <Plus className="w-3 h-3" />{c.additions}
              </span>
            )}
            {c.deletions > 0 && (
              <span className="text-destructive flex items-center gap-0.5">
                <Minus className="w-3 h-3" />{c.deletions}
              </span>
            )}
          </div>
        )}
        {c.htmlUrl ? (
          <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
            <a href={c.htmlUrl} target="_blank" rel="noreferrer" title="View on GitHub">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    </li>
  )
}

// ─── Author stat card ─────────────────────────────────────────────────────────
function AuthorCard({ stats, rank }: { stats: AuthorStats; rank: number }) {
  const initials = stats.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
        {rank}
      </div>
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{stats.name}</p>
        <p className="text-xs text-muted-foreground">{stats.commits} commit{stats.commits !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono shrink-0">
        {stats.additions > 0 && <span className="text-success">+{stats.additions}</span>}
        {stats.deletions > 0 && <span className="text-destructive">-{stats.deletions}</span>}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function GitHubContent() {
  const [commits, setCommits] = useState<GithubCommit[]>([])
  const [repo, setRepo] = useState<string | null>(null)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [branchFilter, setBranchFilter] = useState<string>('all')

  const load = () => {
    setLoading(true)
    api
      .getGithub()
      .then((r) => {
        setCommits(r.commits)
        setRepo(r.repo)
        setConfigured(r.configured)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Derived data
  const branches = useMemo(() => {
    const set = new Set(commits.map((c) => c.branch))
    return Array.from(set).sort()
  }, [commits])

  const filtered = useMemo(() =>
    branchFilter === 'all' ? commits : commits.filter((c) => c.branch === branchFilter),
    [commits, branchFilter]
  )

  const authorStats = useMemo(() => buildAuthorStats(commits), [commits])

  const totalAdditions = commits.reduce((s, c) => s + c.additions, 0)
  const totalDeletions = commits.reduce((s, c) => s + c.deletions, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
          <p className="text-muted-foreground">
            {configured && repo
              ? <span>Linked to <span className="font-mono text-foreground">{repo}</span></span>
              : 'Luau scripts and tooling for your Roblox studio'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Sync
        </Button>
      </div>

      {/* Not configured */}
      {!configured ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <GitBranch className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="mb-1 font-medium text-foreground">No repository linked</p>
            <p>
              Add your repo in{' '}
              <Link href="/settings" className="text-primary hover:underline">Settings</Link>{' '}
              as <code className="text-xs bg-muted px-1 rounded">owner/repo</code> and set{' '}
              <code className="text-xs bg-muted px-1 rounded">GITHUB_TOKEN</code> in the backend.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {configured && (
        <>
          {/* Overview stats row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total commits</p>
                <p className="text-2xl font-bold tabular-nums mt-1">{commits.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Lines added</p>
                <p className="text-2xl font-bold tabular-nums mt-1 text-success">+{totalAdditions.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Lines removed</p>
                <p className="text-2xl font-bold tabular-nums mt-1 text-destructive">-{totalDeletions.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Commit list */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitCommit className="w-4 h-4" />
                      Commits
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      {filtered.length} of {commits.length} shown
                    </CardDescription>
                  </div>
                  {branches.length > 1 && (
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <GitBranch className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        <SelectValue placeholder="All branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All branches</SelectItem>
                        {branches.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    {commits.length === 0 ? 'No commits cached yet. Click Sync.' : 'No commits on this branch.'}
                  </p>
                ) : (
                  <ul className="divide-y-0">
                    {filtered.map((c) => <CommitRow key={c.id} c={c} />)}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Right column */}
            <div className="space-y-4">
              {/* Contributors */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Contributors
                  </CardTitle>
                  <CardDescription className="text-xs">Ranked by commits in this sync</CardDescription>
                </CardHeader>
                <CardContent>
                  {authorStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data yet.</p>
                  ) : (
                    authorStats.map((s, i) => <AuthorCard key={s.name} stats={s} rank={i + 1} />)
                  )}
                </CardContent>
              </Card>

              {/* Branches */}
              {branches.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Branches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {branches.map((b) => {
                        const count = commits.filter((c) => c.branch === b).length
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBranchFilter(b === branchFilter ? 'all' : b)}
                            className={cn(
                              'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
                              branchFilter === b
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'border-border text-muted-foreground hover:text-foreground hover:border-border'
                            )}
                          >
                            {b}
                            <span className="text-[10px] opacity-60">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
