'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { DocMarkdown } from '@/components/doc-markdown'
import {
  FileText,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Star,
  Edit3,
  Loader2,
  RefreshCw,
  Save,
  BookOpen,
  Gamepad2,
  Palette,
  Volume2,
  Code,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/format'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DocDetail, DocFavorite, DocRecent, DocTreeFolder } from '@/lib/types'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'gamepad-2': Gamepad2,
  palette: Palette,
  'volume-2': Volume2,
  code: Code,
}

function folderIcon(name: string | null): LucideIcon {
  return (name && iconMap[name]) || FileText
}

function DocSidebar({
  tree,
  favorites,
  selectedDoc,
  onSelectDoc,
  expandedFolders,
  onToggleFolder,
  searchQuery,
  onSearchChange,
  onNewDoc,
  onNewFolder,
}: {
  tree: DocTreeFolder[]
  favorites: DocFavorite[]
  selectedDoc: string | null
  onSelectDoc: (id: string) => void
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onNewDoc: () => void
  onNewFolder: () => void
}) {
  const q = searchQuery.toLowerCase()

  return (
    <div className="w-64 flex-shrink-0 border-r border-border flex flex-col bg-card/30">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-semibold">Documentation</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewFolder} title="New folder">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewDoc} title="New document">
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search docs..."
            className="pl-9 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {favorites.length > 0 ? (
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Favorites
            </p>
            {favorites.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoc(doc.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                  selectedDoc === doc.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="flex-1 text-left truncate">{doc.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="p-2">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            All Documents
          </p>
          {tree.map((folder) => {
            const Icon = folderIcon(folder.icon)
            const children = folder.children.filter(
              (c) => !q || c.title.toLowerCase().includes(q)
            )
            if (q && children.length === 0 && !folder.title.toLowerCase().includes(q)) {
              return null
            }
            const expanded = expandedFolders.has(folder.id) || Boolean(q)

            return (
              <div key={folder.id} className="mt-1">
                <button
                  type="button"
                  onClick={() => onToggleFolder(folder.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-left truncate">{folder.title}</span>
                </button>
                {expanded ? (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {children.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => onSelectDoc(doc.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                          selectedDoc === doc.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 text-left truncate">{doc.title}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

function DocViewer({
  doc,
  loading,
  editing,
  editContent,
  saving,
  onToggleEdit,
  onContentChange,
  onSave,
  onToggleFavorite,
}: {
  doc: DocDetail | null
  loading: boolean
  editing: boolean
  editContent: string
  saving: boolean
  onToggleEdit: () => void
  onContentChange: (v: string) => void
  onSave: () => void
  onToggleFavorite: () => void
}) {
  if (!doc && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Select a document</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a document from the sidebar to view its contents
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{doc.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <span>Last edited {formatRelativeTime(doc.updatedAt)}</span>
            {doc.lastEditedBy ? (
              <>
                <span>by</span>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                {doc.lastEditedBy.avatarInitials}
              </div>
              <span>{doc.lastEditedBy.displayName}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onToggleFavorite}>
            <Star
              className={cn('w-4 h-4 mr-2', doc.isFavorite && 'fill-current text-warning')}
            />
            {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          {editing ? (
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          ) : (
            <Button size="sm" onClick={onToggleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {editing ? (
            <Textarea
              value={editContent}
              onChange={(e) => onContentChange(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <DocMarkdown content={doc.content} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function DocsContent() {
  const [tree, setTree] = useState<DocTreeFolder[]>([])
  const [favorites, setFavorites] = useState<DocFavorite[]>([])
  const [recent, setRecent] = useState<DocRecent[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [createDocOpen, setCreateDocOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newParentId, setNewParentId] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingTree, setLoadingTree] = useState(true)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const didInit = useRef(false)

  const loadTree = useCallback(async () => {
    setLoadingTree(true)
    setError(null)
    try {
      const data = await api.getDocsTree()
      setTree(data.tree)
      setFavorites(data.favorites)
      setRecent(data.recent)
      if (!didInit.current) {
        const gameDesign = data.tree.find((f) => f.title === 'Game Design')
        const firstPage = gameDesign?.children[0] ?? data.tree[0]?.children[0]
        if (firstPage) {
          setSelectedDoc(firstPage.id)
          const folderId = gameDesign?.id ?? data.tree[0]?.id
          if (folderId) setExpandedFolders(new Set([folderId]))
        }
        didInit.current = true
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load docs')
    } finally {
      setLoadingTree(false)
    }
  }, [])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  useEffect(() => {
    if (!selectedDoc) {
      setDoc(null)
      return
    }
    let cancelled = false
    setLoadingDoc(true)
    api
      .getDoc(selectedDoc)
      .then(({ doc: loaded }) => {
        if (!cancelled) {
          setDoc(loaded)
          setEditContent(loaded.content)
          setEditing(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load document')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDoc(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedDoc])

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedFolders(next)
  }

  const handleSave = async () => {
    if (!doc) return
    setSaving(true)
    try {
      const { doc: updated } = await api.updateDoc(doc.id, { content: editContent })
      setDoc(updated)
      setEditing(false)
      await loadTree()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!doc) return
    try {
      const { doc: updated } = await api.updateDoc(doc.id, { isFavorite: !doc.isFavorite })
      setDoc((d) => (d ? { ...d, isFavorite: updated.isFavorite } : d))
      await loadTree()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update favorite')
    }
  }

  const handleCreateDoc = async () => {
    if (!newTitle.trim() || !newParentId) return
    setCreating(true)
    try {
      const { doc: created } = await api.createDoc({
        title: newTitle.trim(),
        parentId: newParentId,
      })
      setCreateDocOpen(false)
      setNewTitle('')
      await loadTree()
      setSelectedDoc(created.id)
      setExpandedFolders((prev) => new Set([...prev, newParentId]))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create document')
    } finally {
      setCreating(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      await api.createDocFolder({ title: newTitle.trim() })
      setCreateFolderOpen(false)
      setNewTitle('')
      await loadTree()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create folder')
    } finally {
      setCreating(false)
    }
  }

  if (loadingTree) {
    return (
      <div className="flex items-center justify-center h-64 -m-6">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full -m-6">
      <DocSidebar
        tree={tree}
        favorites={favorites}
        selectedDoc={selectedDoc}
        onSelectDoc={setSelectedDoc}
        expandedFolders={expandedFolders}
        onToggleFolder={toggleFolder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewDoc={() => {
          setNewTitle('')
          setNewParentId(tree[0]?.id ?? '')
          setCreateDocOpen(true)
        }}
        onNewFolder={() => {
          setNewTitle('')
          setCreateFolderOpen(true)
        }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {error ? (
          <div className="mx-4 mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-2">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={loadTree}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
        <DocViewer
          doc={doc}
          loading={loadingDoc}
          editing={editing}
          editContent={editContent}
          saving={saving}
          onToggleEdit={() => {
            if (editing && doc) setEditContent(doc.content)
            setEditing(!editing)
          }}
          onContentChange={setEditContent}
          onSave={handleSave}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      <div className="w-56 flex-shrink-0 border-l border-border p-4 hidden xl:block">
        <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {recent.slice(0, 5).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedDoc(item.id)}
              className="w-full flex items-start gap-2 text-left hover:opacity-80"
            >
              {item.editedBy ? (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0">
                  {item.editedBy.avatarInitials}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(item.editedAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={createDocOpen} onOpenChange={setCreateDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New markdown document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Combat system" />
            </div>
            <div className="space-y-2">
              <Label>Folder</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {tree.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDocOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDoc} disabled={creating || !newTitle.trim() || !newParentId}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Folder name</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Game Design" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={creating || !newTitle.trim()}>
              Create folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
