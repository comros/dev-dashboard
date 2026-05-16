'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import type { AnalyticsSnapshot, Experience } from '@/lib/types'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function AnalyticsContent() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([])
  const [selectedId, setSelectedId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [ccu, setCcu] = useState('0')
  const [visits, setVisits] = useState('0')
  const [favorites, setFavorites] = useState('0')
  const [revenue, setRevenue] = useState('0')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const expId = selectedId === 'all' ? undefined : selectedId
      const res = await api.getAnalytics(expId)
      setExperiences(res.experiences)
      setSnapshots(res.snapshots)
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    load()
  }, [load])

  const chartData = snapshots.map((s) => ({
    date: s.recordedAt.slice(0, 10),
    ccu: s.ccu,
    visits: Number(s.visits),
  }))

  const handleSnapshot = async () => {
    const expId = selectedId === 'all' ? experiences[0]?.id : selectedId
    if (!expId) return
    await api.createSnapshot({
      experienceId: expId,
      ccu: Number(ccu) || 0,
      visits: Number(visits) || 0,
      favorites: Number(favorites) || 0,
      revenueCents: Math.round((Number(revenue) || 0) * 100),
    })
    await load()
  }

  const latest = snapshots[snapshots.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track Roblox experience metrics. Record snapshots manually until Roblox Open Cloud is connected.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>Experience</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All experiences</SelectItem>
              {experiences.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Latest CCU" value={latest?.ccu?.toLocaleString() ?? '—'} />
            <MetricCard label="Visits" value={latest ? Number(latest.visits).toLocaleString() : '—'} />
            <MetricCard label="Favorites" value={latest?.favorites?.toLocaleString() ?? '—'} />
            <MetricCard
              label="Revenue"
              value={
                latest
                  ? `$${(latest.revenueCents / 100).toLocaleString()}`
                  : '—'
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">CCU over time</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="ccu" stroke="hsl(var(--primary))" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No snapshots yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record snapshot</CardTitle>
              <CardDescription>Log current metrics for your selected experience</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
              <div className="space-y-2">
                <Label>CCU</Label>
                <Input value={ccu} onChange={(e) => setCcu(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Visits</Label>
                <Input value={visits} onChange={(e) => setVisits(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Favorites</Label>
                <Input value={favorites} onChange={(e) => setFavorites(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Revenue ($)</Label>
                <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} type="number" />
              </div>
              <Button onClick={handleSnapshot} disabled={experiences.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Save
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}
