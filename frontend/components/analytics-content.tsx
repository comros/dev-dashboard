'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, Loader2, Plus, TrendingDown, TrendingUp, BarChart2, RefreshCw,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { api } from '@/lib/api'
import type { AnalyticsSnapshot, Experience } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const axisStyle = { fontSize: 11, fill: 'var(--muted-foreground)' }

function formatCompact(n: number) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function delta(current: number, previous: number) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

// ─── Range cutoff ─────────────────────────────────────────────────────────────
function rangeCutoff(range: string): Date {
  const now = new Date()
  const days: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }
  const d = new Date(now)
  d.setDate(d.getDate() - (days[range] ?? 30))
  return d
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl px-3 py-2 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((item: any) => (
        <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="capitalize text-muted-foreground">{item.name}</span>
          </div>
          <span className="font-semibold tabular-nums">{Number(item.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function Metric({
  label, value, deltaValue, hint,
}: {
  label: string
  value: string
  deltaValue?: number | null
  hint?: string
}) {
  const positive = (deltaValue ?? 0) >= 0

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight tabular-nums mt-2">{value}</p>
      {deltaValue != null ? (
        <div className={cn('flex items-center gap-1 text-xs font-medium mt-2', positive ? 'text-success' : 'text-destructive')}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? '+' : ''}{deltaValue.toFixed(1)}%
          <span className="text-muted-foreground">vs previous</span>
        </div>
      ) : hint ? (
        <p className="text-xs text-muted-foreground mt-2">{hint}</p>
      ) : null}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function AnalyticsContent() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([])
  const [selectedId, setSelectedId] = useState<string>('all')
  const [metric, setMetric] = useState<string>('ccu')
  const [range, setRange] = useState<string>('30d')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Snapshot form
  const [ccu, setCcu] = useState('0')
  const [visits, setVisits] = useState('0')
  const [favorites, setFavorites] = useState('0')
  const [revenue, setRevenue] = useState('0')
  const [snapshotExp, setSnapshotExp] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const expId = selectedId === 'all' ? undefined : selectedId
      const res = await api.getAnalytics(expId)
      setExperiences(res.experiences)
      setSnapshots(res.snapshots)
      // Pre-select first experience in form if none selected
      if (!snapshotExp && res.experiences.length > 0) {
        setSnapshotExp(res.experiences[0].id)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedId]) // intentionally omit snapshotExp to avoid loop

  useEffect(() => { load() }, [load])

  // Filter snapshots by range (client-side)
  const cutoff = useMemo(() => rangeCutoff(range), [range])
  const filteredSnapshots = useMemo(
    () => snapshots.filter((s) => new Date(s.recordedAt) >= cutoff),
    [snapshots, cutoff]
  )

  const latest = filteredSnapshots[filteredSnapshots.length - 1]
  const prev   = filteredSnapshots[filteredSnapshots.length - 2]

  // Chart data
  const chartData = useMemo(() =>
    filteredSnapshots.map((s) => ({
      date:      formatDateLabel(s.recordedAt),
      ccu:       s.ccu,
      visits:    Number(s.visits),
      favorites: s.favorites,
      revenue:   s.revenueCents / 100,
    })),
    [filteredSnapshots]
  )

  // Current metric value for big number display
  const metricKey = metric === 'revenue' ? 'revenueCents' : metric as keyof AnalyticsSnapshot
  const currentVal = latest ? Number(latest[metricKey] ?? 0) : 0
  const prevVal    = prev   ? Number(prev[metricKey]    ?? 0) : 0
  const metricDelta = delta(currentVal, prevVal)

  // Latest snapshot per experience (for rankings — REAL data)
  const latestByExp = useMemo(() => {
    const map: Record<string, AnalyticsSnapshot> = {}
    for (const s of snapshots) {
      if (!map[s.experienceId] || s.recordedAt > map[s.experienceId].recordedAt) {
        map[s.experienceId] = s
      }
    }
    return map
  }, [snapshots])

  const prevByExp = useMemo(() => {
    // second-to-last per experience
    const seen: Record<string, boolean> = {}
    const map: Record<string, AnalyticsSnapshot> = {}
    for (const s of [...snapshots].reverse()) {
      if (seen[s.experienceId]) {
        if (!map[s.experienceId]) map[s.experienceId] = s
      } else {
        seen[s.experienceId] = true
      }
    }
    return map
  }, [snapshots])

  // Conversion rate: favorites / visits
  const conversionRate = latest
    ? ((latest.favorites / Math.max(Number(latest.visits), 1)) * 100).toFixed(1) + '%'
    : '—'

  // Revenue in Robux (revenueCents is in USD cents, show as $)
  const revenueStr = latest
    ? `$${formatCompact((latest.revenueCents ?? 0) / 100)}`
    : '$0'

  const handleSnapshot = async () => {
    const expId = snapshotExp || experiences[0]?.id
    if (!expId) return
    setSaving(true)
    try {
      await api.createSnapshot({
        experienceId: expId,
        ccu:          Number(ccu),
        visits:       Number(visits),
        favorites:    Number(favorites),
        revenueCents: Math.round(Number(revenue) * 100),
      })
      await load()
      setCcu('0'); setVisits('0'); setFavorites('0'); setRevenue('0')
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
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track CCU, visits, favorites, and revenue across your Roblox experiences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={range} onValueChange={setRange}>
            <TabsList>
              <TabsTrigger value="24h">24H</TabsTrigger>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Experience selector */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Experience</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All experiences</SelectItem>
              {experiences.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground pb-1">
          {filteredSnapshots.length} snapshots in range
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Peak CCU"
          value={formatCompact(latest?.ccu ?? 0)}
          deltaValue={delta(latest?.ccu ?? 0, prev?.ccu ?? 0)}
          hint="Concurrent players at snapshot time"
        />
        <Metric
          label="Total Visits"
          value={formatCompact(Number(latest?.visits ?? 0))}
          deltaValue={delta(Number(latest?.visits ?? 0), Number(prev?.visits ?? 0))}
          hint="All-time place visits on Roblox"
        />
        <Metric
          label="Favorites"
          value={formatCompact(latest?.favorites ?? 0)}
          deltaValue={delta(latest?.favorites ?? 0, prev?.favorites ?? 0)}
          hint="Players who favorited the game"
        />
        <Metric
          label="Revenue"
          value={revenueStr}
          deltaValue={delta(latest?.revenueCents ?? 0, prev?.revenueCents ?? 0)}
          hint="Snapshot revenue (USD)"
        />
      </div>

      {/* Conversion rate banner */}
      {latest && Number(latest.visits) > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/40 px-5 py-3">
          <BarChart2 className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">
              Conversion rate: <span className="text-primary">{conversionRate}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Favorites / Visits — industry target for Roblox games is 5–15%
            </p>
          </div>
        </div>
      )}

      {/* Main chart */}
      <Card className="border-border/50 bg-card/40 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <p className="text-base font-semibold">Performance Trends</p>
              <p className="text-sm text-muted-foreground mt-0.5">Snapshot history · {range} view</p>
            </div>
            <Tabs value={metric} onValueChange={setMetric}>
              <TabsList>
                <TabsTrigger value="ccu">CCU</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Current value */}
          <div className="flex items-end gap-3 mb-6">
            <p className="text-4xl font-bold tracking-tight tabular-nums">
              {metric === 'revenue'
                ? `$${formatCompact(currentVal / 100)}`
                : formatCompact(currentVal)}
            </p>
            {metricDelta != null && (
              <div className={cn('flex items-center gap-1 text-sm font-medium mb-1', metricDelta >= 0 ? 'text-success' : 'text-destructive')}>
                {metricDelta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metricDelta >= 0 ? '+' : ''}{metricDelta.toFixed(1)}%
              </div>
            )}
          </div>

          <div className="h-[320px]">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={50} tickFormatter={formatCompact} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="var(--primary)"
                    fill="url(#analyticsGradient)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--primary)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-muted p-3 mb-4 inline-flex">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Not enough data</p>
                  <p className="text-sm text-muted-foreground mt-1">Record at least 2 snapshots to see trends.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Experience rankings — REAL data */}
        <Card className="xl:col-span-2 border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">Experience Rankings</CardTitle>
            <CardDescription>Latest snapshot stats per experience</CardDescription>
          </CardHeader>
          <CardContent>
            {experiences.length === 0 ? (
              <p className="text-sm text-muted-foreground">No experiences added yet.</p>
            ) : (
              <div className="space-y-2">
                {experiences
                  .map((exp) => {
                    const snap = latestByExp[exp.id]
                    const prev = prevByExp[exp.id]
                    const ccu = snap?.ccu ?? 0
                    const d = prev ? delta(ccu, prev.ccu) : null
                    return { exp, snap, ccu, d }
                  })
                  .sort((a, b) => b.ccu - a.ccu)
                  .map(({ exp, snap, ccu, d }, i) => (
                    <div key={exp.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{exp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exp.robloxUniverseId ? `Universe ${exp.robloxUniverseId}` : 'No Universe ID'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {snap ? (
                          <>
                            <p className="font-semibold tabular-nums text-sm">{formatCompact(ccu)} CCU</p>
                            {d != null ? (
                              <p className={cn('text-xs mt-0.5', d >= 0 ? 'text-success' : 'text-destructive')}>
                                {d >= 0 ? '+' : ''}{d.toFixed(1)}%
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-xs">No data</Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Record snapshot */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">Record Snapshot</CardTitle>
            <CardDescription>Save live metrics for trend tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {experiences.length > 1 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Experience</Label>
                  <Select value={snapshotExp} onValueChange={setSnapshotExp}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {experiences.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Concurrent Players (CCU)</Label>
                <Input value={ccu} onChange={(e) => setCcu(e.target.value)} type="number" className="h-9" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Total Visits</Label>
                <Input value={visits} onChange={(e) => setVisits(e.target.value)} type="number" className="h-9" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Favorites</Label>
                <Input value={favorites} onChange={(e) => setFavorites(e.target.value)} type="number" className="h-9" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Revenue ($)</Label>
                <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} type="number" step="0.01" className="h-9" />
              </div>

              <Button className="w-full" onClick={handleSnapshot} disabled={saving || (!snapshotExp && experiences.length === 0)}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" />Save Snapshot</>}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Pull live stats from Roblox Creator Hub and paste them here periodically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
