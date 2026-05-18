'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Pencil,
  Trash2,
  ArrowRight,
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

const priorityColors = {
  urgent: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-primary',
  low: 'bg-muted-foreground',
}

const priorityTextColors = {
  urgent: 'text-destructive',
  high: 'text-warning',
  medium: 'text-primary',
  low: 'text-muted-foreground',
}

const priorityLabels = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function DueDateBadge({ date, done }: { date: string; done: boolean }) {
  const isOverdue = !done && new Date(date) < new Date()
  return (
    <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
      <Calendar className="w-3 h-3" />
      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      {isOverdue && <span className="font-semibold">· overdue</span>}
    </div>
  )
}

// ─── Drag state (module-level for simplicity — no library needed) ────────────
let draggingId: string | null = null

function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}) {
  const expName = task.experience?.name
  const ref = useRef<HTMLDivElement>(null)

  // Next statuses for context menu quick-move
  const currentIndex = columns.findIndex((c) => c.id === task.status)
  const nextColumn = columns[currentIndex + 1]

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={ref}
          draggable
          onDragStart={(e) => {
            draggingId = task.id
            e.dataTransfer.effectAllowed = 'move'
            // Fade the card while dragging
            setTimeout(() => {
              if (ref.current) ref.current.style.opacity = '0.4'
            }, 0)
          }}
          onDragEnd={() => {
            draggingId = null
            if (ref.current) ref.current.style.opacity = '1'
          }}
        >
          <Card className="py-3 hover:border-primary/30 transition-colors group cursor-grab active:cursor-grabbing select-none">
            <CardContent className="px-3">
              <p className="text-sm font-medium line-clamp-2">{task.title}</p>

              {task.description ? (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{task.description}</p>
              ) : null}

              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
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
              )}

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className={cn('flex items-center gap-1 text-xs font-medium', priorityTextColors[task.priority])}>
                    <div className={cn('w-1.5 h-1.5 rounded-full', priorityColors[task.priority])} />
                    {priorityLabels[task.priority]}
                  </span>
                  {task.assignee ? (
                    <div
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[9px] font-medium text-primary-foreground"
                      title={task.assignee.displayName}
                    >
                      {task.assignee.avatarInitials}
                    </div>
                  ) : null}
                  {expName ? <span className="text-xs text-muted-foreground truncate max-w-[72px]">{expName}</span> : null}
                </div>
                {task.dueDate ? <DueDateBadge date={task.dueDate} done={task.status === 'done'} /> : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onEdit(task)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit task
        </ContextMenuItem>
        {nextColumn ? (
          <ContextMenuItem onClick={() => onStatusChange(task.id, nextColumn.id)}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Move to {nextColumn.title}
          </ContextMenuItem>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDelete(task)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete task
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function KanbanColumn({
  column,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onDrop,
  onQuickAdd,
}: {
  column: (typeof columns)[0]
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onDrop: (taskId: string, status: TaskStatus) => void
  onQuickAdd: () => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const Icon = column.icon

  return (
    <div
      className="flex flex-col w-72 shrink-0"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setIsDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (draggingId) {
          onDrop(draggingId, column.id)
        }
      }}
    >
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
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={onQuickAdd}
          title={`Add task to ${column.title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div
        className={cn(
          'flex-1 space-y-2 overflow-y-auto pr-1 rounded-lg transition-colors min-h-[80px] p-1',
          isDragOver && 'bg-primary/5 ring-1 ring-primary/20'
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 ? (
          <div
            className={cn(
              'flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg transition-colors',
              isDragOver && 'border-primary/40 bg-primary/5'
            )}
          >
            <p className="text-sm text-muted-foreground">
              {isDragOver ? 'Drop here' : 'No tasks'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── Task Form (shared for create + edit) ────────────────────────────────────
function TaskForm({
  open,
  onOpenChange,
  initialValues,
  members,
  experiences,
  onSubmit,
  saving,
  mode,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialValues: Partial<Task>
  members: Profile[]
  experiences: Experience[]
  onSubmit: (values: Partial<Task>) => void
  saving: boolean
  mode: 'create' | 'edit'
}) {
  const [title, setTitle] = useState(initialValues.title ?? '')
  const [description, setDescription] = useState(initialValues.description ?? '')
  const [priority, setPriority] = useState<Task['priority']>(initialValues.priority ?? 'medium')
  const [assignee, setAssignee] = useState(initialValues.assignee?.id ?? 'none')
  const [experience, setExperience] = useState(initialValues.experienceId ?? 'none')
  const [status, setStatus] = useState<TaskStatus>(initialValues.status ?? 'backlog')

  // Sync when initialValues change (e.g. different task opened for edit)
  useEffect(() => {
    setTitle(initialValues.title ?? '')
    setDescription(initialValues.description ?? '')
    setPriority(initialValues.priority ?? 'medium')
    setAssignee(initialValues.assignee?.id ?? 'none')
    setExperience(initialValues.experienceId ?? 'none')
    setStatus(initialValues.status ?? 'backlog')
  }, [initialValues])

  const handleSubmit = () => {
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description,
      priority,
      assignee: assignee === 'none' ? null : members.find((m) => m.id === assignee) ?? null,
      experienceId: experience === 'none' ? undefined : experience,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New task' : 'Edit task'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional details…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
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
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
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
            <div className="space-y-2">
              <Label>Experience</Label>
              <Select value={experience} onValueChange={setExperience}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'create' ? 'Create' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
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

  // Create / edit dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('backlog')
  const [formSaving, setFormSaving] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  useEffect(() => { load() }, [load])

  // ── Status change (from context menu quick-move or drag-and-drop) ──────────
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

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (values: Partial<Task>) => {
    setFormSaving(true)
    try {
      const { task } = await api.createTask({
        title: values.title!,
        description: values.description,
        priority: values.priority,
        assigneeId: values.assignee?.id ?? null,
        experienceId: values.experienceId ?? null,
        status: values.status ?? 'backlog',
      })
      setTasks((list) => [task, ...list])
      setFormOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task')
    } finally {
      setFormSaving(false)
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = async (values: Partial<Task>) => {
    if (!editingTask) return
    setFormSaving(true)
    try {
      const { task } = await api.updateTask(editingTask.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        assigneeId: values.assignee?.id ?? null,
        experienceId: values.experienceId ?? null,
        status: values.status,
      })
      setTasks((list) => list.map((t) => (t.id === task.id ? task : t)))
      setFormOpen(false)
      setEditingTask(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update task')
    } finally {
      setFormSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.deleteTask(deleteTarget.id)
      setTasks((list) => list.filter((t) => t.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete task')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesAssignee = filterAssignee === 'all' || task.assignee?.id === filterAssignee
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
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your team&apos;s work with Kanban boards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setEditingTask(null)
              setNewTaskStatus('backlog')
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card/50 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
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
                {member.displayName}
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

      {/* ── Board ── */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getColumnTasks(column.id)}
              onStatusChange={handleStatusChange}
              onEdit={(task) => {
                setEditingTask(task)
                setFormOpen(true)
              }}
              onDelete={setDeleteTarget}
              onDrop={handleStatusChange}
              onQuickAdd={() => {
                setEditingTask(null)
                setNewTaskStatus(column.id)
                setFormOpen(true)
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Create / Edit form ── */}
      <TaskForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v)
          if (!v) setEditingTask(null)
        }}
        initialValues={editingTask ?? { status: newTaskStatus }}
        members={members}
        experiences={experiences}
        onSubmit={editingTask ? handleEdit : handleCreate}
        saving={formSaving}
        mode={editingTask ? 'edit' : 'create'}
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
