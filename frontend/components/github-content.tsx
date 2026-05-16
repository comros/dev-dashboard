'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitBranch, Loader2, RefreshCw, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import type { GithubCommit } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'
import Link from 'next/link'

export function GitHubContent() {
  const [commits, setCommits] = useState<GithubCommit[]>([])
  const [repo, setRepo] = useState<string | null>(null)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
          <p className="text-muted-foreground">
            Luau scripts &amp; tooling — linked repo for your Roblox studio
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync
        </Button>
      </div>

      {!configured ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <p>Set your repo in <Link href="/settings" className="text-primary">Settings</Link> as{' '}
              <code className="text-xs bg-muted px-1 rounded">owner/repo</code> and add{' '}
              <code className="text-xs bg-muted px-1 rounded">GITHUB_TOKEN</code> to the backend .env.
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Repository: <span className="font-mono text-foreground">{repo}</span>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Recent commits
          </CardTitle>
          <CardDescription>Latest activity from your default branch</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : commits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No commits cached yet. Click Sync.</p>
          ) : (
            <ul className="space-y-4">
              {commits.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{c.message}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{c.authorName}</span>
                      <Badge variant="outline">{c.branch}</Badge>
                      <span>{formatRelativeTime(c.committedAt)}</span>
                      {c.additions > 0 || c.deletions > 0 ? (
                        <span className="text-success">+{c.additions}</span>
                      ) : null}
                    </div>
                  </div>
                  {c.htmlUrl ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={c.htmlUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
