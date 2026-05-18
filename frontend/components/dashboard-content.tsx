'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Loader2,
  Users,
  DollarSign,
  CheckSquare,
  Gamepad2,
  GitBranch,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { api } from '@/lib/api'
import type { DashboardData } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const axisStyle = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur px-3 py-2 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>

      {payload.map((item: any) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <span className="capitalize text-muted-foreground">
              {item.name}
            </span>
          </div>

          <span className="font-semibold tabular-nums">
            {Number(item.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const experienceStatusStyle: Record<string, string> = {
  live:        'bg-success/10 text-success border border-success/20',
  development: 'bg-primary/10 text-primary border border-primary/20',
  maintenance: 'bg-warning/10 text-warning border border-warning/20',
  archived:    'bg-muted text-muted-foreground',
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const greeting = getGreeting()
  const firstName = profile?.displayName?.split(' ')[0] ?? null

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load')
      )
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

  const revenue = (data.stats.totalRevenueCents / 100).toLocaleString(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening in your studio today.
        </p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Concurrent players"
          value={data.stats.totalCcu.toLocaleString()}
          href="/analytics"
        />

        <StatCard
          icon={Gamepad2}
          title="Experiences"
          value={String(data.stats.experienceCount)}
          href="/settings"
        />

        <StatCard
          icon={CheckSquare}
          title="Active tasks"
          value={String(data.stats.activeTasks)}
          href="/tasks"
        />

        <StatCard
          icon={DollarSign}
          title="Revenue"
          value={revenue}
          href="/analytics"
        />
      </div>

      {/* Charts */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CCU */}

        <Card className="overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-base">
              CCU Trend
            </CardTitle>

            <CardDescription>
              Concurrent player history
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[320px] pt-0">
            {data.chartData.ccuHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData.ccuHistory}>
                  <defs>
                    <linearGradient
                      id="dashboardGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)/0.6"
                  />

                  <XAxis
                    dataKey="date"
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="url(#dashboardGradient)"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive
                    animationDuration={800}
                    activeDot={{
                      r: 5,
                      fill: 'var(--primary)',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart hint="Record analytics snapshots to see trends" />
            )}
          </CardContent>
        </Card>

        {/* Revenue */}

        <Card className="overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-base">
              Revenue Trend
            </CardTitle>

            <CardDescription>
              Snapshot revenue performance
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[320px] pt-0">
            {data.chartData.revenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData.revenueHistory}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)/0.6"
                  />

                  <XAxis
                    dataKey="date"
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Bar
                    dataKey="value"
                    fill="var(--chart-2)"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart hint="Revenue data will appear here" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Experiences */}

        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Experiences
              </CardTitle>

              <CardDescription>
                Your Roblox games
              </CardDescription>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                Add experience
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            {data.experiences.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-2">
                No experiences yet
              </p>
            ) : (
              data.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="
                    rounded-xl
                    border
                    border-border/50
                    bg-card/40
                    p-4
                    transition-all
                    duration-300
                    hover:border-primary/30
                  "
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {exp.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn('capitalize text-xs', experienceStatusStyle[exp.status])}
                    >
                      {exp.status}
                    </Badge>
                  </div>

                  {exp.robloxUniverseId ? (
                    <p className="text-xs text-muted-foreground mt-2">
                      Universe {exp.robloxUniverseId}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tasks */}

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Active Tasks
            </CardTitle>

            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/tasks">
                View all
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open tasks
              </p>
            ) : (
              data.recentTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />

                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {t.title}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {t.status.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commits */}

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Recent commits
          </CardTitle>

          <CardDescription>
            Latest GitHub repository activity
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {data.recentCommits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Link a GitHub repository to display commits
            </p>
          ) : (
            data.recentCommits.map((c) => (
              <div
                key={c.id}
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-border/50
                  pb-3
                  text-sm
                  last:border-0
                "
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {c.message}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {c.authorName} · {c.branch} ·{' '}
                    {formatRelativeTime(c.committedAt)}
                  </p>
                </div>

                {c.htmlUrl ? (
                  <a
                    href={c.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary shrink-0"
                  >
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
  href,
}: {
  icon: LucideIcon
  title: string
  value: string
  href?: string
}) {
  const card = (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block">{card}</Link>
  }
  return card
}

function EmptyChart({ hint }: { hint: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Activity className="w-5 h-5 text-muted-foreground" />
      </div>

      <p className="text-sm font-medium">
        No chart data
      </p>

      <p className="text-xs text-muted-foreground mt-1">
        {hint}
      </p>
    </div>
  )
}