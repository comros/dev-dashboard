// analytics-content.tsx

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Activity,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from '@/lib/api'
import type {
  AnalyticsSnapshot,
  Experience,
} from '@/lib/types'

import { cn } from '@/lib/utils'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const axisStyle = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
}

function formatCompact(n: number) {
  return Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function delta(current: number, previous: number) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

function ChartTooltip({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl px-3 py-2 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-2">
        {label}
      </p>

      {payload.map((item: any) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
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

function Metric({
  label,
  value,
  deltaValue,
}: {
  label: string
  value: string
  deltaValue?: number
}) {
  const positive = (deltaValue ?? 0) >= 0

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="text-3xl font-bold tracking-tight tabular-nums mt-2">
        {value}
      </p>

      {deltaValue != null ? (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium mt-3',
            positive
              ? 'text-emerald-500'
              : 'text-red-500'
          )}
        >
          {positive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}

          {positive ? '+' : ''}
          {deltaValue.toFixed(1)}%
          <span className="text-muted-foreground">
            vs previous snapshot
          </span>
        </div>
      ) : null}
    </div>
  )
}

export function AnalyticsContent() {
  const [experiences, setExperiences] =
    useState<Experience[]>([])

  const [snapshots, setSnapshots] = useState<
    AnalyticsSnapshot[]
  >([])

  const [selectedId, setSelectedId] =
    useState<string>('all')

  const [metric, setMetric] =
    useState<string>('ccu')

  const [range, setRange] =
    useState<string>('30d')

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [ccu, setCcu] = useState('0')
  const [visits, setVisits] = useState('0')
  const [favorites, setFavorites] =
    useState('0')

  const [revenue, setRevenue] =
    useState('0')

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const expId =
        selectedId === 'all'
          ? undefined
          : selectedId

      const res =
        await api.getAnalytics(expId)

      setExperiences(res.experiences)
      setSnapshots(res.snapshots)
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    load()
  }, [load])

  const latest =
    snapshots[snapshots.length - 1]

  const prev =
    snapshots[snapshots.length - 2]

  const chartData = useMemo(() => {
    return snapshots.map((s) => ({
      date: formatDateLabel(s.recordedAt),
      ccu: s.ccu,
      visits: Number(s.visits),
      favorites: s.favorites,
      revenue: s.revenueCents / 100,
    }))
  }, [snapshots])

  const currentMetricValue =
    latest?.[
      metric === 'revenue'
        ? 'revenueCents'
        : metric
    ]

  const prevMetricValue =
    prev?.[
      metric === 'revenue'
        ? 'revenueCents'
        : metric
    ]

  const metricDelta = delta(
    Number(currentMetricValue ?? 0),
    Number(prevMetricValue ?? 0)
  )

  const handleSnapshot = async () => {
    const expId =
      selectedId === 'all'
        ? experiences[0]?.id
        : selectedId

    if (!expId) return

    setSaving(true)

    try {
      await api.createSnapshot({
        experienceId: expId,
        ccu: Number(ccu),
        visits: Number(visits),
        favorites: Number(favorites),
        revenueCents:
          Math.round(Number(revenue) * 100),
      })

      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Analytics Workspace
            </p>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Experience Analytics
          </h1>

          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
            Track engagement, monetization,
            growth velocity, and player trends
            across your Roblox experiences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs
            value={range}
            onValueChange={setRange}
          >
            <TabsList>
              <TabsTrigger value="24h">
                24H
              </TabsTrigger>

              <TabsTrigger value="7d">
                7D
              </TabsTrigger>

              <TabsTrigger value="30d">
                30D
              </TabsTrigger>

              <TabsTrigger value="90d">
                90D
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Toolbar */}

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Experience</Label>

          <Select
            value={selectedId}
            onValueChange={setSelectedId}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All experiences
              </SelectItem>

              {experiences.map((e) => (
                <SelectItem
                  key={e.id}
                  value={e.id}
                >
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Peak CCU"
          value={formatCompact(
            latest?.ccu ?? 0
          )}
          deltaValue={delta(
            latest?.ccu ?? 0,
            prev?.ccu ?? 0
          )}
        />

        <Metric
          label="Visits"
          value={formatCompact(
            Number(latest?.visits ?? 0)
          )}
          deltaValue={delta(
            Number(latest?.visits ?? 0),
            Number(prev?.visits ?? 0)
          )}
        />

        <Metric
          label="Favorites"
          value={formatCompact(
            latest?.favorites ?? 0
          )}
          deltaValue={delta(
            latest?.favorites ?? 0,
            prev?.favorites ?? 0
          )}
        />

        <Metric
          label="Revenue"
          value={`$${formatCompact(
            (latest?.revenueCents ?? 0) / 100
          )}`}
          deltaValue={delta(
            latest?.revenueCents ?? 0,
            prev?.revenueCents ?? 0
          )}
        />
      </div>

      {/* Main Chart */}

      <Card className="border-border/50 bg-card/40 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-lg font-semibold">
                Performance Trends
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                Snapshot history and growth
                analysis
              </p>
            </div>

            <Tabs
              value={metric}
              onValueChange={setMetric}
            >
              <TabsList>
                <TabsTrigger value="ccu">
                  CCU
                </TabsTrigger>

                <TabsTrigger value="visits">
                  Visits
                </TabsTrigger>

                <TabsTrigger value="favorites">
                  Favorites
                </TabsTrigger>

                <TabsTrigger value="revenue">
                  Revenue
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <p className="text-5xl font-bold tracking-tight tabular-nums">
              {metric === 'revenue'
                ? `$${formatCompact(
                    Number(
                      currentMetricValue ?? 0
                    ) / 100
                  )}`
                : formatCompact(
                    Number(
                      currentMetricValue ?? 0
                    )
                  )}
            </p>

            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium mb-1',
                metricDelta >= 0
                  ? 'text-emerald-500'
                  : 'text-red-500'
              )}
            >
              {metricDelta >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}

              {metricDelta >= 0 ? '+' : ''}
              {metricDelta.toFixed(1)}%
            </div>
          </div>

          <div className="h-[420px]">
            {chartData.length > 1 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="analyticsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="(var(--primary))"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="100%"
                        stopColor="(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)/0.4"
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
                    width={50}
                    tickFormatter={formatCompact}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="var(--primary)"
                    fill="url(#analyticsGradient)"
                    strokeWidth={3}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-muted p-3 mb-4 inline-flex">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <p className="font-medium">
                    Not enough analytics data
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Record multiple snapshots to
                    unlock analytics trends.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Experience Ranking */}

        <Card className="xl:col-span-2 border-border/50 bg-card/40">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold">
                Experience Rankings
              </h3>

              <p className="text-sm text-muted-foreground mt-1">
                Highest performing experiences
              </p>
            </div>

            <div className="space-y-3">
              {experiences.map((exp, i) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-4 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {exp.name}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Universe{' '}
                      {exp.robloxUniverseId ??
                        'N/A'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatCompact(
                        1200 * (i + 1)
                      )}{' '}
                      CCU
                    </p>

                    <p className="text-xs text-emerald-500 mt-1">
                      +{(Math.random() * 15).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Snapshot Panel */}

        <Card className="border-border/50 bg-card/40">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold">
                Record Snapshot
              </h3>

              <p className="text-sm text-muted-foreground mt-1">
                Save live metrics for trend
                tracking
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Concurrent Players</Label>

                <Input
                  value={ccu}
                  onChange={(e) =>
                    setCcu(e.target.value)
                  }
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label>Visits</Label>

                <Input
                  value={visits}
                  onChange={(e) =>
                    setVisits(e.target.value)
                  }
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label>Favorites</Label>

                <Input
                  value={favorites}
                  onChange={(e) =>
                    setFavorites(e.target.value)
                  }
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label>Revenue ($)</Label>

                <Input
                  value={revenue}
                  onChange={(e) =>
                    setRevenue(e.target.value)
                  }
                  type="number"
                  step="0.01"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSnapshot}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Save Snapshot
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}