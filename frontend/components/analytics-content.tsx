'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { games } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// Extended analytics data
const dauData = [
  { date: 'Feb 1', dau: 780000, newUsers: 45000, returning: 735000 },
  { date: 'Feb 2', dau: 820000, newUsers: 52000, returning: 768000 },
  { date: 'Feb 3', dau: 850000, newUsers: 48000, returning: 802000 },
  { date: 'Feb 4', dau: 830000, newUsers: 41000, returning: 789000 },
  { date: 'Feb 5', dau: 890000, newUsers: 55000, returning: 835000 },
  { date: 'Feb 6', dau: 920000, newUsers: 62000, returning: 858000 },
  { date: 'Feb 7', dau: 892000, newUsers: 58000, returning: 834000 },
]

const revenueBreakdown = [
  { date: 'Feb 1', gamePasses: 45000, devProducts: 32000, premium: 18000 },
  { date: 'Feb 2', gamePasses: 48000, devProducts: 35000, premium: 19500 },
  { date: 'Feb 3', gamePasses: 52000, devProducts: 38000, premium: 21000 },
  { date: 'Feb 4', gamePasses: 49000, devProducts: 36000, premium: 20000 },
  { date: 'Feb 5', gamePasses: 55000, devProducts: 40000, premium: 22500 },
  { date: 'Feb 6', gamePasses: 58000, devProducts: 42000, premium: 24000 },
  { date: 'Feb 7', gamePasses: 56000, devProducts: 41000, premium: 23400 },
]

const sessionData = [
  { hour: '00:00', sessions: 12000, avgDuration: 15 },
  { hour: '04:00', sessions: 8000, avgDuration: 18 },
  { hour: '08:00', sessions: 25000, avgDuration: 12 },
  { hour: '12:00', sessions: 45000, avgDuration: 22 },
  { hour: '16:00', sessions: 62000, avgDuration: 28 },
  { hour: '20:00', sessions: 75000, avgDuration: 35 },
  { hour: '23:00', sessions: 48000, avgDuration: 25 },
]

const retentionData = [
  { day: 'D1', rate: 45 },
  { day: 'D3', rate: 32 },
  { day: 'D7', rate: 22 },
  { day: 'D14', rate: 15 },
  { day: 'D30', rate: 10 },
]

const platformData = [
  { name: 'Mobile', value: 58, color: 'oklch(0.75 0.18 195)' },
  { name: 'Desktop', value: 28, color: 'oklch(0.70 0.20 145)' },
  { name: 'Console', value: 14, color: 'oklch(0.70 0.18 50)' },
]

const regionData = [
  { region: 'North America', players: 380000, revenue: 52000 },
  { region: 'Europe', players: 290000, revenue: 38000 },
  { region: 'Asia Pacific', players: 180000, revenue: 22000 },
  { region: 'South America', players: 85000, revenue: 8500 },
  { region: 'Other', players: 45000, revenue: 4900 },
]

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function MetricCard({
  title,
  value,
  change,
  trend,
  subtitle,
}: {
  title: string
  value: string
  change?: number
  trend?: 'up' | 'down'
  subtitle?: string
}) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            {change !== undefined && (
              <span
                className={cn(
                  'flex items-center text-sm font-medium',
                  trend === 'up' ? 'text-success' : 'text-destructive'
                )}
              >
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(change)}%
              </span>
            )}
          </div>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsContent() {
  const [selectedGame, setSelectedGame] = useState(games[0].id)
  const [timeRange, setTimeRange] = useState('7d')
  
  const game = games.find((g) => g.id === selectedGame) || games[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select game" />
            </SelectTrigger>
            <SelectContent>
              {games.filter((g) => g.status === 'live').map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="DAU"
          value={formatNumber(game.dau)}
          change={5.3}
          trend="up"
          subtitle="Daily Active Users"
        />
        <MetricCard
          title="MAU"
          value={formatNumber(game.dau * 12)}
          change={8.1}
          trend="up"
          subtitle="Monthly Active Users"
        />
        <MetricCard
          title="CCU Peak"
          value={formatNumber(game.ccu * 1.3)}
          change={12.5}
          trend="up"
          subtitle="Today at 8:00 PM"
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(game.revenue)}
          change={game.revenueChange}
          trend={game.revenueChange >= 0 ? 'up' : 'down'}
          subtitle="This week"
        />
        <MetricCard
          title="ARPDAU"
          value="$0.14"
          change={3.2}
          trend="up"
          subtitle="Avg Revenue per DAU"
        />
        <MetricCard
          title="D1 Retention"
          value="45%"
          change={2.1}
          trend="up"
          subtitle="Day 1 Retention"
        />
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          {/* DAU Chart */}
          <Card className="py-4">
            <CardHeader className="px-4 pb-2">
              <CardTitle className="text-base">Daily Active Users</CardTitle>
              <CardDescription>New vs returning users over time</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dauData}>
                    <defs>
                      <linearGradient id="newUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="returning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.20 145)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.70 0.20 145)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                    <XAxis dataKey="date" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.16 0.005 260)',
                        border: '1px solid oklch(0.25 0.01 260)',
                        borderRadius: '8px',
                        color: 'oklch(0.95 0 0)',
                      }}
                      formatter={(value: number) => [formatNumber(value), '']}
                    />
                    <Area type="monotone" dataKey="returning" stackId="1" stroke="oklch(0.70 0.20 145)" fill="url(#returning)" strokeWidth={2} name="Returning" />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="oklch(0.75 0.18 195)" fill="url(#newUsers)" strokeWidth={2} name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Returning Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">New Users</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="text-base">Session Distribution</CardTitle>
                <CardDescription>Sessions by time of day</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                      <XAxis dataKey="hour" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.005 260)',
                          border: '1px solid oklch(0.25 0.01 260)',
                          borderRadius: '8px',
                          color: 'oklch(0.95 0 0)',
                        }}
                        formatter={(value: number) => [formatNumber(value), 'Sessions']}
                      />
                      <Bar dataKey="sessions" fill="oklch(0.75 0.18 195)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="text-base">Avg Session Duration</CardTitle>
                <CardDescription>Minutes per session by time of day</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                      <XAxis dataKey="hour" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} unit=" min" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.005 260)',
                          border: '1px solid oklch(0.25 0.01 260)',
                          borderRadius: '8px',
                          color: 'oklch(0.95 0 0)',
                        }}
                        formatter={(value: number) => [`${value} min`, 'Avg Duration']}
                      />
                      <Line type="monotone" dataKey="avgDuration" stroke="oklch(0.70 0.18 50)" strokeWidth={2} dot={{ fill: 'oklch(0.70 0.18 50)', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Breakdown */}
          <Card className="py-4">
            <CardHeader className="px-4 pb-2">
              <CardTitle className="text-base">Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by monetization type</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueBreakdown}>
                    <defs>
                      <linearGradient id="gamePasses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="devProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.20 145)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.70 0.20 145)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="premium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.18 50)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.70 0.18 50)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                    <XAxis dataKey="date" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${formatNumber(v)}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.16 0.005 260)',
                        border: '1px solid oklch(0.25 0.01 260)',
                        borderRadius: '8px',
                        color: 'oklch(0.95 0 0)',
                      }}
                      formatter={(value: number) => [formatCurrency(value), '']}
                    />
                    <Area type="monotone" dataKey="gamePasses" stackId="1" stroke="oklch(0.75 0.18 195)" fill="url(#gamePasses)" strokeWidth={2} name="Game Passes" />
                    <Area type="monotone" dataKey="devProducts" stackId="1" stroke="oklch(0.70 0.20 145)" fill="url(#devProducts)" strokeWidth={2} name="Dev Products" />
                    <Area type="monotone" dataKey="premium" stackId="1" stroke="oklch(0.70 0.18 50)" fill="url(#premium)" strokeWidth={2} name="Premium" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Game Passes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Dev Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Premium</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="py-4">
            <CardHeader className="px-4 pb-2">
              <CardTitle className="text-base">Top Selling Products</CardTitle>
              <CardDescription>Best performing in-game purchases</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-3">
                {[
                  { name: 'Dragon Rider Pass', type: 'Game Pass', sales: 12500, revenue: 24975 },
                  { name: '1000 Gold Bundle', type: 'Dev Product', sales: 8900, revenue: 8900 },
                  { name: 'VIP Access', type: 'Game Pass', sales: 6200, revenue: 12400 },
                  { name: 'Speed Boost (1h)', type: 'Dev Product', sales: 15600, revenue: 4680 },
                  { name: 'Exclusive Pet Pack', type: 'Game Pass', sales: 4100, revenue: 8200 },
                ].map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(product.sales)} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retention Curve */}
            <Card className="py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="text-base">Retention Curve</CardTitle>
                <CardDescription>Player retention over time</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                      <XAxis dataKey="day" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.005 260)',
                          border: '1px solid oklch(0.25 0.01 260)',
                          borderRadius: '8px',
                          color: 'oklch(0.95 0 0)',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Retention']}
                      />
                      <Bar dataKey="rate" fill="oklch(0.75 0.18 195)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cohort Analysis Preview */}
            <Card className="py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="text-base">Retention Benchmarks</CardTitle>
                <CardDescription>How your retention compares</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="space-y-4">
                  {[
                    { metric: 'D1 Retention', value: 45, benchmark: 40, status: 'above' },
                    { metric: 'D7 Retention', value: 22, benchmark: 20, status: 'above' },
                    { metric: 'D30 Retention', value: 10, benchmark: 12, status: 'below' },
                    { metric: 'Avg Session Length', value: 24, benchmark: 18, status: 'above', unit: 'min' },
                    { metric: 'Sessions per DAU', value: 2.4, benchmark: 2.0, status: 'above' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.value}{item.unit || '%'}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              item.status === 'above' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                            )}
                          >
                            {item.status === 'above' ? 'Above' : 'Below'} avg
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            item.status === 'above' ? 'bg-success' : 'bg-destructive'
                          )}
                          style={{ width: `${Math.min((item.value / item.benchmark) * 50, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card className="py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="text-base">Platform Distribution</CardTitle>
                <CardDescription>Players by device type</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.005 260)',
                          border: '1px solid oklch(0.25 0.01 260)',
                          borderRadius: '8px',
                          color: 'oklch(0.95 0 0)',
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-2">
                  {platformData.map((platform, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                      <span className="text-sm text-muted-foreground">
                        {platform.name} ({platform.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card className="py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="text-base">Regional Distribution</CardTitle>
                <CardDescription>Players and revenue by region</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="space-y-3">
                  {regionData.map((region, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{region.region}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(region.players)} players
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(region.revenue)}</p>
                        <p className="text-xs text-muted-foreground">weekly revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
