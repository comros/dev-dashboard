'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Users, DollarSign, CheckSquare, Gamepad2, GitBranch } from 'lucide-react'
import { api } from '@/lib/api'
import type { DashboardData } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
        {error ?? 'No data'}
      </div>
    )
  }

  const revenue = (data.stats.totalRevenueCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Studio Dashboard</h1>
        <p className="text-muted-foreground">
          Roblox experiences, live tasks, and recent GitHub activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Concurrent players" value={data.stats.totalCcu.toLocaleString()} />
        <StatCard icon={Gamepad2} title="Experiences" value={String(data.stats.experienceCount)} />
        <StatCard icon={CheckSquare} title="Active tasks" value={String(data.stats.activeTasks)} />
        <StatCard icon={DollarSign} title="Revenue (latest)" value={revenue} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CCU trend</CardTitle>
            <CardDescription>From analytics snapshots — add data in Analytics</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            {data.chartData.ccuHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData.ccuHistory}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart hint="Record a snapshot in Analytics" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {data.chartData.revenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData.revenueHistory}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart hint="Record a snapshot in Analytics" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Experiences</CardTitle>
              <CardDescription>Your Roblox games in this workspace</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">Add experience</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {data.experiences.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-2">
                No experiences yet. Add one in Settings → Experiences.
              </p>
            ) : (
              data.experiences.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{exp.name}</p>
                    <Badge variant="secondary">{exp.status}</Badge>
                  </div>
                  {exp.robloxUniverseId ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      Universe {exp.robloxUniverseId}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active tasks</CardTitle>
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/tasks">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open tasks</p>
            ) : (
              data.recentTasks.map((t) => (
                <div key={t.id} className="flex items-start gap-2 text-sm">
                  <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.status.replace('-', ' ')}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Recent commits
          </CardTitle>
          <CardDescription>From your linked GitHub repo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentCommits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Link a repo in Settings and set GITHUB_TOKEN on the backend.
            </p>
          ) : (
            data.recentCommits.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 text-sm border-b border-border pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.authorName} · {c.branch} · {formatRelativeTime(c.committedAt)}
                  </p>
                </div>
                {c.htmlUrl ? (
                  <a href={c.htmlUrl} target="_blank" rel="noreferrer" className="text-xs text-primary shrink-0">
                    View
                  </a>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Users
  title: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyChart({ hint }: { hint: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      {hint}
    </div>
  )
}
