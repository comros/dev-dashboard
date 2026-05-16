'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Star,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
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
} from 'recharts'
import { games, ccuHistory, revenueHistory, tasks, commits, teamMembers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

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

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  change?: number
  icon: React.ElementType
  trend?: 'up' | 'down'
}) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </div>
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trend === 'up' ? 'text-success' : 'text-destructive'
              )}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GameCard({ game }: { game: (typeof games)[0] }) {
  const statusColors = {
    live: 'bg-success/20 text-success',
    development: 'bg-info/20 text-info',
    maintenance: 'bg-warning/20 text-warning',
  }

  return (
    <Card className="py-4 hover:border-primary/30 transition-colors">
      <CardContent className="px-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{game.name}</h3>
            <Badge variant="secondary" className={cn('mt-1 text-xs', statusColors[game.status])}>
              {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{formatNumber(game.ccu)}</span>
            </div>
            <span className="text-xs text-muted-foreground">CCU</span>
          </div>
        </div>

        {game.status === 'live' && (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">DAU</p>
                <p className="font-medium">{formatNumber(game.dau)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Revenue (7d)</p>
                <p className="font-medium">{formatCurrency(game.revenue)}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-medium">{game.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {game.lastUpdated}
              </div>
            </div>
          </>
        )}

        {game.status === 'development' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Development Progress</span>
              <span className="font-medium">65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        )}

        {game.status === 'maintenance' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-warning">
            <Activity className="w-4 h-4" />
            <span>Server maintenance in progress</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
  const totalCCU = games.reduce((sum, game) => sum + game.ccu, 0)
  const totalRevenue = games.reduce((sum, game) => sum + game.revenue, 0)
  const totalDAU = games.reduce((sum, game) => sum + game.dau, 0)
  const activeTasks = tasks.filter((t) => t.status === 'in-progress').length

  const recentTasks = tasks.filter((t) => t.status !== 'done').slice(0, 4)
  const recentCommits = commits.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s what&apos;s happening with your games.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total CCU"
          value={formatNumber(totalCCU)}
          change={8.2}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Weekly Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Total DAU"
          value={formatNumber(totalDAU)}
          change={5.3}
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Active Tasks"
          value={activeTasks.toString()}
          icon={Zap}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CCU Chart */}
        <Card className="lg:col-span-2 py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-base">Live CCU Trend</CardTitle>
            <CardDescription>Concurrent users over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ccuHistory}>
                  <defs>
                    <linearGradient id="ccuDragon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ccuTower" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.70 0.20 145)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.70 0.20 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                  <XAxis
                    dataKey="time"
                    stroke="oklch(0.55 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.55 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.16 0.005 260)',
                      border: '1px solid oklch(0.25 0.01 260)',
                      borderRadius: '8px',
                      color: 'oklch(0.95 0 0)',
                    }}
                    formatter={(value: number) => [formatNumber(value), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="dragonRealm"
                    stroke="oklch(0.75 0.18 195)"
                    fillOpacity={1}
                    fill="url(#ccuDragon)"
                    strokeWidth={2}
                    name="Dragon Realm"
                  />
                  <Area
                    type="monotone"
                    dataKey="towerDefense"
                    stroke="oklch(0.70 0.20 145)"
                    fillOpacity={1}
                    fill="url(#ccuTower)"
                    strokeWidth={2}
                    name="Tower Defense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Dragon Realm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Tower Defense</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Weekly revenue performance</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                  <XAxis
                    dataKey="date"
                    stroke="oklch(0.55 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.55 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.16 0.005 260)',
                      border: '1px solid oklch(0.25 0.01 260)',
                      borderRadius: '8px',
                      color: 'oklch(0.95 0 0)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="oklch(0.75 0.18 195)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Games</h2>
          <Badge variant="secondary">{games.length} games</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card className="py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-base">Active Tasks</CardTitle>
            <CardDescription>Tasks currently in progress or pending</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      task.priority === 'urgent' && 'bg-destructive',
                      task.priority === 'high' && 'bg-warning',
                      task.priority === 'medium' && 'bg-primary',
                      task.priority === 'low' && 'bg-muted-foreground'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.assignee && (
                        <span className="text-xs text-muted-foreground">
                          {task.assignee.name}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Commits */}
        <Card className="py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-base">Recent Commits</CardTitle>
            <CardDescription>Latest code changes from the team</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-3">
              {recentCommits.map((commit) => (
                <div
                  key={commit.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0 mt-2',
                      commit.status === 'success' && 'bg-success',
                      commit.status === 'pending' && 'bg-warning',
                      commit.status === 'failed' && 'bg-destructive'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate font-mono">{commit.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{commit.author.name}</span>
                      <span>•</span>
                      <span>{commit.branch}</span>
                      <span>•</span>
                      <span>{commit.timestamp}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    <span className="text-success">+{commit.additions}</span>
                    {' / '}
                    <span className="text-destructive">-{commit.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Status */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-base">Team Status</CardTitle>
          <CardDescription>Who&apos;s online and working</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-wrap gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 min-w-[200px]"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-sm font-medium text-primary-foreground">
                    {member.avatar}
                  </div>
                  <div
                    className={cn(
                      'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card',
                      member.status === 'online' && 'bg-success',
                      member.status === 'away' && 'bg-warning',
                      member.status === 'offline' && 'bg-muted-foreground'
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
