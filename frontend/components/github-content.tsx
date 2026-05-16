'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  Play,
  MoreHorizontal,
  Plus,
  Users,
  Calendar,
} from 'lucide-react'
import { commits, teamMembers, games } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// Extended GitHub data
const branches = [
  { name: 'main', protected: true, lastCommit: '2 hours ago', ahead: 0, behind: 0 },
  { name: 'feature/combat-system', protected: false, lastCommit: '10 minutes ago', ahead: 12, behind: 3 },
  { name: 'feature/enemy-ai', protected: false, lastCommit: '3 hours ago', ahead: 8, behind: 5 },
  { name: 'feature/ui-refresh', protected: false, lastCommit: '5 hours ago', ahead: 4, behind: 2 },
  { name: 'hotfix/matchmaking', protected: false, lastCommit: '1 hour ago', ahead: 2, behind: 0 },
]

const pullRequests = [
  {
    id: 1,
    title: 'feat: Add new combat animations',
    number: 142,
    author: teamMembers[0],
    branch: 'feature/combat-system',
    target: 'main',
    status: 'open',
    reviewers: [teamMembers[1], teamMembers[2]],
    comments: 8,
    additions: 567,
    deletions: 123,
    createdAt: '2 days ago',
    checks: 'passing',
  },
  {
    id: 2,
    title: 'fix: Resolve matchmaking timeout',
    number: 145,
    author: teamMembers[4],
    branch: 'hotfix/matchmaking',
    target: 'main',
    status: 'review',
    reviewers: [teamMembers[0]],
    comments: 3,
    additions: 45,
    deletions: 12,
    createdAt: '5 hours ago',
    checks: 'passing',
  },
  {
    id: 3,
    title: 'feat: Implement enemy AI behaviors',
    number: 140,
    author: teamMembers[0],
    branch: 'feature/enemy-ai',
    target: 'main',
    status: 'draft',
    reviewers: [],
    comments: 2,
    additions: 890,
    deletions: 234,
    createdAt: '4 days ago',
    checks: 'pending',
  },
  {
    id: 4,
    title: 'style: Update UI components',
    number: 138,
    author: teamMembers[3],
    branch: 'feature/ui-refresh',
    target: 'main',
    status: 'changes-requested',
    reviewers: [teamMembers[0], teamMembers[1]],
    comments: 12,
    additions: 234,
    deletions: 89,
    createdAt: '1 week ago',
    checks: 'failing',
  },
]

const deployments = [
  {
    id: 1,
    environment: 'Production',
    game: games[0].name,
    status: 'success',
    version: 'v2.4.1',
    deployedAt: '2 hours ago',
    deployedBy: teamMembers[0],
    duration: '3m 24s',
  },
  {
    id: 2,
    environment: 'Staging',
    game: games[0].name,
    status: 'success',
    version: 'v2.5.0-beta.1',
    deployedAt: '10 minutes ago',
    deployedBy: teamMembers[0],
    duration: '2m 45s',
  },
  {
    id: 3,
    environment: 'Production',
    game: games[1].name,
    status: 'success',
    version: 'v1.8.3',
    deployedAt: '5 hours ago',
    deployedBy: teamMembers[4],
    duration: '2m 12s',
  },
  {
    id: 4,
    environment: 'Staging',
    game: games[2].name,
    status: 'building',
    version: 'v0.3.0-alpha.5',
    deployedAt: 'In progress',
    deployedBy: teamMembers[0],
    duration: '1m 30s',
  },
]

const workflows = [
  { name: 'CI/CD Pipeline', status: 'success', runs: 156, lastRun: '10 minutes ago' },
  { name: 'Unit Tests', status: 'success', runs: 312, lastRun: '10 minutes ago' },
  { name: 'Integration Tests', status: 'success', runs: 89, lastRun: '2 hours ago' },
  { name: 'Deploy to Staging', status: 'running', runs: 78, lastRun: 'Running now' },
  { name: 'Security Scan', status: 'success', runs: 45, lastRun: '1 day ago' },
]

export function GitHubContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('commits')

  const filteredCommits = commits.filter((c) =>
    c.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
          <p className="text-muted-foreground">Version control and deployment management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Branch
          </Button>
        </div>
      </div>

      {/* Repository Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="py-3">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{branches.length}</p>
                <p className="text-sm text-muted-foreground">Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <GitPullRequest className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{pullRequests.filter((pr) => pr.status !== 'merged').length}</p>
                <p className="text-sm text-muted-foreground">Open PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <GitCommit className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">1,247</p>
                <p className="text-sm text-muted-foreground">Total Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="prs">Pull Requests</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Commits Tab */}
        <TabsContent value="commits" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search commits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card className="py-4">
            <CardContent className="px-4">
              <div className="space-y-1">
                {filteredCommits.map((commit, i) => (
                  <div
                    key={commit.id}
                    className={cn(
                      'flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors',
                      i !== filteredCommits.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0 mt-2',
                        commit.status === 'success' && 'bg-success',
                        commit.status === 'pending' && 'bg-warning',
                        commit.status === 'failed' && 'bg-destructive'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium font-mono truncate">{commit.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                                {commit.author.avatar}
                              </div>
                              {commit.author.name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {commit.branch}
                            </span>
                            <span>•</span>
                            <span>{commit.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-xs text-muted-foreground">
                            <span className="text-success">+{commit.additions}</span>
                            {' / '}
                            <span className="text-destructive">-{commit.deletions}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-4">
          <Card className="py-4">
            <CardContent className="px-4">
              <div className="space-y-1">
                {branches.map((branch, i) => (
                  <div
                    key={branch.name}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors',
                      i !== branches.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono">{branch.name}</span>
                          {branch.protected && (
                            <Badge variant="secondary" className="text-xs">Protected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last commit {branch.lastCommit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {branch.name !== 'main' && (
                        <div className="text-xs text-muted-foreground">
                          <span className="text-success">{branch.ahead} ahead</span>
                          {' / '}
                          <span className="text-destructive">{branch.behind} behind</span>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pull Requests Tab */}
        <TabsContent value="prs" className="space-y-4">
          <Card className="py-4">
            <CardContent className="px-4">
              <div className="space-y-3">
                {pullRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-1">
                          {pr.status === 'open' && (
                            <GitPullRequest className="w-5 h-5 text-success" />
                          )}
                          {pr.status === 'review' && (
                            <GitPullRequest className="w-5 h-5 text-warning" />
                          )}
                          {pr.status === 'draft' && (
                            <GitPullRequest className="w-5 h-5 text-muted-foreground" />
                          )}
                          {pr.status === 'changes-requested' && (
                            <GitPullRequest className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{pr.title}</span>
                            <span className="text-muted-foreground">#{pr.number}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[8px] font-medium text-primary-foreground">
                                {pr.author.avatar}
                              </div>
                              {pr.author.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {pr.branch} → {pr.target}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {pr.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-xs text-muted-foreground">
                          <span className="text-success">+{pr.additions}</span>
                          {' / '}
                          <span className="text-destructive">-{pr.deletions}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            pr.checks === 'passing' && 'bg-success/20 text-success',
                            pr.checks === 'pending' && 'bg-warning/20 text-warning',
                            pr.checks === 'failing' && 'bg-destructive/20 text-destructive'
                          )}
                        >
                          {pr.checks === 'passing' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {pr.checks === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {pr.checks === 'failing' && <XCircle className="w-3 h-3 mr-1" />}
                          {pr.checks}
                        </Badge>
                      </div>
                    </div>
                    {pr.reviewers.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">Reviewers:</span>
                        <div className="flex -space-x-2">
                          {pr.reviewers.map((reviewer) => (
                            <div
                              key={reviewer.id}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground border-2 border-card"
                              title={reviewer.name}
                            >
                              {reviewer.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          <Card className="py-4">
            <CardContent className="px-4">
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          deployment.status === 'success' && 'bg-success/20',
                          deployment.status === 'building' && 'bg-warning/20',
                          deployment.status === 'failed' && 'bg-destructive/20'
                        )}
                      >
                        {deployment.status === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                        {deployment.status === 'building' && (
                          <RefreshCw className="w-5 h-5 text-warning animate-spin" />
                        )}
                        {deployment.status === 'failed' && (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{deployment.game}</span>
                          <Badge variant="secondary" className="text-xs">
                            {deployment.environment}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono">{deployment.version}</span>
                          <span>•</span>
                          <span>{deployment.deployedAt}</span>
                          <span>•</span>
                          <span>by {deployment.deployedBy.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{deployment.duration}</span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card className="py-4">
            <CardHeader className="px-4 pb-2">
              <CardTitle className="text-base">Workflows</CardTitle>
              <CardDescription>Automated CI/CD pipelines</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          workflow.status === 'success' && 'bg-success',
                          workflow.status === 'running' && 'bg-warning animate-pulse',
                          workflow.status === 'failed' && 'bg-destructive'
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground">{workflow.lastRun}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {workflow.runs} runs
                      </span>
                      <Button variant="ghost" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
