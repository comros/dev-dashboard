'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Calendar,
  Circle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'
import type { Experience, Profile, Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const columns: { id: TaskStatus; title: string; icon: typeof Circle }[] = [
  { id: 'backlog', title: 'Backlog', icon: Circle },
  { id: 'todo', title: 'To Do', icon: Circle },
  { id: 'in-progress', title: 'In Progress', icon: Clock },
  { id: 'review', title: 'Review', icon: AlertCircle },
  { id: 'done', title: 'Done', icon: CheckCircle2 },
]

const priorityIcons = {
  urgent: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-primary',
  low: 'bg-muted-foreground',
}

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const expName = task.experience?.name

  return (
    <Card className="py-3 hover:border-primary/30 transition-colors group">
      <CardContent className="px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn('w-2 h-2 rounded-full shrink-0', priorityIcons[task.priority])}
            />
            <span className="text-sm font-medium line-clamp-2">{task.title}</span>
          </div>
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task.id, value as TaskStatus)}
          >
            <SelectTrigger className="h-7 w-[110px] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {task.description ? (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 ? (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{task.tags.length - 3}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div
                className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                title={task.assignee.displayName}
              >
                {task.assignee.avatarInitials}
              </div>
            ) : null}
            {expName ? <span className="text-xs text-muted-foreground">{expName}</span> : null}
          </div>
          {task.dueDate ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({
  column,
  tasks,
  onStatusChange,
}: {
  column: (typeof columns)[0]
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const Icon = column.icon

  return (
    <div className="flex flex-col w-72 shrink-0">
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
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterGame, setFilterGame] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium')
  const [newAssignee, setNewAssignee] = useState<string>('none')
  const [newExperience, setNewExperience] = useState<string>('none')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tasksRes, membersRes, expRes] = await Promise.all([
        api.getTasks(),
        api.getTaskMembers(),
        api.getExperiences(),
      ])
      setTasks(tasksRes.tasks)
      setMembers(membersRes.members)
      setExperiences(expRes.experiences)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    const previous = tasks
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)))
    try {
      const { task } = await api.updateTask(id, { status })
      setTasks((list) => list.map((t) => (t.id === id ? task : t)))
    } catch {
      setTasks(previous)
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      const { task } = await api.createTask({
        title: newTitle.trim(),
        description: newDescription,
        priority: newPriority,
        assigneeId: newAssignee === 'none' ? null : newAssignee,
        experienceId: newExperience === 'none' ? null : newExperience,
        status: 'backlog',
      })
      setTasks((list) => [task, ...list])
      setCreateOpen(false)
      setNewTitle('')
      setNewDescription('')
      setNewPriority('medium')
      setNewAssignee('none')
      setNewExperience('none')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesAssignee =
      filterAssignee === 'all' || task.assignee?.id === filterAssignee
    const matchesGame = filterGame === 'all' || task.experienceId === filterGame
    return matchesSearch && matchesPriority && matchesAssignee && matchesGame
  })

  const getColumnTasks = (columnId: string) =>
    filteredTasks.filter((task) => task.status === columnId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full -m-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your team&apos;s work with Kanban boards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <p className="text-xs mt-1 text-muted-foreground">
            Ensure the backend is running and Supabase migrations are applied.
          </p>
        </div>
      ) : null}

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
            {members.map((member) => (
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
            {experiences.map((game) => (
              <SelectItem key={game.id} value={game.id}>
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getColumnTasks(column.id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newPriority}
                  onValueChange={(v) => setNewPriority(v as Task['priority'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Experience</Label>
              <Select value={newExperience} onValueChange={setNewExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {experiences.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !newTitle.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
