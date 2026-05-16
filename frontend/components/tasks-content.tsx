'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Tag,
  Circle,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { tasks, teamMembers, games, type Task } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const columns = [
  { id: 'backlog', title: 'Backlog', icon: Circle },
  { id: 'todo', title: 'To Do', icon: Circle },
  { id: 'in-progress', title: 'In Progress', icon: Clock },
  { id: 'review', title: 'Review', icon: AlertCircle },
  { id: 'done', title: 'Done', icon: CheckCircle2 },
]

const priorityColors = {
  urgent: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-primary text-primary-foreground',
  low: 'bg-muted text-muted-foreground',
}

const priorityIcons = {
  urgent: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-primary',
  low: 'bg-muted-foreground',
}

function TaskCard({ task }: { task: Task }) {
  const game = games.find((g) => g.id === task.gameId)

  return (
    <Card className="py-3 hover:border-primary/30 transition-colors cursor-pointer group">
      <CardContent className="px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityIcons[task.priority])}
            />
            <span className="text-sm font-medium line-clamp-2">{task.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {task.assignee && (
              <div
                className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                title={task.assignee.name}
              >
                {task.assignee.avatar}
              </div>
            )}
            {game && (
              <span className="text-xs text-muted-foreground">{game.name}</span>
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({
  column,
  tasks,
}: {
  column: (typeof columns)[0]
  tasks: Task[]
}) {
  const Icon = column.icon

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'w-4 h-4',
              column.id === 'done' && 'text-success',
              column.id === 'in-progress' && 'text-primary',
              column.id === 'review' && 'text-warning'
            )}
          />
          <h3 className="font-medium text-sm">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function TasksContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterGame, setFilterGame] = useState<string>('all')

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesAssignee =
      filterAssignee === 'all' || task.assignee?.id === filterAssignee
    const matchesGame = filterGame === 'all' || task.gameId === filterGame

    return matchesSearch && matchesPriority && matchesAssignee && matchesGame
  })

  const getColumnTasks = (columnId: string) =>
    filteredTasks.filter((task) => task.status === columnId)

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your team&apos;s work with Kanban boards</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterGame} onValueChange={setFilterGame}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            {games.map((game) => (
              <SelectItem key={game.id} value={game.id}>
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getColumnTasks(column.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
