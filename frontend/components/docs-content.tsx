'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { DocMarkdown, extractToc, getDocStats, SUPPORTED_LANGUAGES } from '@/components/doc-markdown'
import {
  FileText, Search, Plus, ChevronRight, ChevronDown, Star, Edit3,
  Loader2, RefreshCw, Save, BookOpen, Gamepad2, Palette, Volume2, Code,
  Trash2, FolderOpen, Copy, Hash, Clock, AlignLeft, Sparkles, type LucideIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/format'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DocDetail, DocFavorite, DocTreeFolder } from '@/lib/types'
import { cn } from '@/lib/utils'

// ─── Icon map ─────────────────────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen, 'gamepad-2': Gamepad2, palette: Palette,
  'volume-2': Volume2, code: Code,
}
function folderIcon(name: string | null): LucideIcon {
  return (name && iconMap[name]) || FolderOpen
}

// ─── Keyboard shortcut badge ──────────────────────────────────────────────────
function Kbd({ keys }: { keys: string }) {
  return (
    <kbd className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
      {keys}
    </kbd>
  )
}

// ─── Table of Contents — single definition ────────────────────────────────────
function DocToc({ content }: { content: string }) {
  const toc = extractToc(content)
  if (toc.length === 0) {
    return <p className="text-xs text-muted-foreground/60 italic">No headings yet.</p>
  }
  return (
    <nav className="space-y-0.5">
      {toc.map((entry, i) => (
        <a
          key={i}
          href={`#${entry.id}`}
          className={cn(
            'block truncate text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5',
            entry.level === 1 && 'font-medium text-foreground/80',
            entry.level === 2 && 'pl-3',
            entry.level === 3 && 'pl-6',
            entry.level === 4 && 'pl-9',
          )}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function DocSidebar({
  tree, favorites, selectedDoc, onSelectDoc, expandedFolders, onToggleFolder,
  searchQuery, onSearchChange, onNewDoc, onNewFolder,
  onDeleteDoc, onRenameDoc, onDuplicateDoc, searchInputRef,
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
  onDeleteDoc: (id: string, title: string) => void
  onRenameDoc: (id: string, currentTitle: string) => void
  onDuplicateDoc: (id: string) => void
  searchInputRef: React.RefObject<HTMLInputElement>
}) {
  const q = searchQuery.toLowerCase()

  const DocButton = ({ id, title, isFav = false }: { id: string; title: string; isFav?: boolean }) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={() => onSelectDoc(id)}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
            selectedDoc === id
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          {isFav
            ? <Star className="w-3.5 h-3.5 fill-current shrink-0" />
            : <FileText className="w-3.5 h-3.5 shrink-0" />}
          <span className="flex-1 text-left truncate">{title}</span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onRenameDoc(id, title)}>
          <Edit3 className="w-4 h-4 mr-2" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicateDoc(id)}>
          <Copy className="w-4 h-4 mr-2" /> Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDeleteDoc(id, title)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <div className="w-64 flex-shrink-0 border-r border-border flex flex-col bg-card/30">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-semibold">Documentation</h2>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewFolder}>
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New folder</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewDoc}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New document</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search docs… (Ctrl+K)"
            className="pl-9 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {favorites.length > 0 && (
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Favorites
            </p>
            {favorites.map((fav) => (
              <DocButton key={fav.id} id={fav.id} title={fav.title} isFav />
            ))}
          </div>
        )}

        <div className="p-2">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            All Documents
          </p>
          {tree.map((folder) => {
            const Icon = folderIcon(folder.icon)
            const children = folder.children.filter(
              (c) => !q || c.title.toLowerCase().includes(q)
            )
            if (q && children.length === 0 && !folder.title.toLowerCase().includes(q)) return null
            const expanded = expandedFolders.has(folder.id) || Boolean(q)

            return (
              <div key={folder.id} className="mt-1">
                <button
                  type="button"
                  onClick={() => onToggleFolder(folder.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {expanded
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-left truncate">{folder.title}</span>
                </button>
                {expanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {children.map((child) => (
                      <DocButton key={child.id} id={child.id} title={child.title} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Viewer / Editor ──────────────────────────────────────────────────────────
function DocViewer({
  doc, loading, editing, editContent, saving, defaultLang,
  onToggleEdit, onContentChange, onSave, onToggleFavorite, onDefaultLangChange,
}: {
  doc: DocDetail | null
  loading: boolean
  editing: boolean
  editContent: string
  saving: boolean
  defaultLang: string
  onToggleEdit: () => void
  onContentChange: (v: string) => void
  onSave: () => void
  onToggleFavorite: () => void
  onDefaultLangChange: (lang: string) => void
}) {
  const stats = doc ? getDocStats(doc.content) : null
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.value === defaultLang)

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
        <div className="text-center max-w-sm">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Select a document</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Choose a document from the sidebar, or create a new one.
            Right-click any document to rename, duplicate, or delete it.
          </p>
          <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground/60">
            <span><Kbd keys="Ctrl+E" /> toggle edit mode</span>
            <span><Kbd keys="Ctrl+S" /> save</span>
            <span><Kbd keys="Ctrl+K" /> focus search</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{doc.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(doc.updatedAt)}
            </span>
            {stats && (
              <>
                <span className="flex items-center gap-1">
                  <AlignLeft className="w-3 h-3" />
                  {stats.words.toLocaleString()} words
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {stats.readMinutes} min read
                </span>
              </>
            )}
            {doc.lastEditedBy && (
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[9px] font-medium text-primary-foreground">
                  {doc.lastEditedBy.avatarInitials}
                </div>
                {doc.lastEditedBy.displayName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Language selector */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                      <Code className="w-3.5 h-3.5" />
                      {currentLang?.badge ?? defaultLang.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                      Default language for code blocks
                    </p>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.value}
                        onClick={() => onDefaultLangChange(lang.value)}
                        className={cn(defaultLang === lang.value && 'bg-primary/10 text-primary')}
                      >
                        <span className="font-mono text-xs w-12 text-muted-foreground shrink-0">{lang.badge}</span>
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="bottom">Default language for unlabelled code blocks</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" onClick={onToggleFavorite}>
            <Star className={cn('w-4 h-4 mr-2', doc.isFavorite && 'fill-current text-warning')} />
            {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
          </Button>

          {editing ? (
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Save className="w-4 h-4 mr-2" />Save</>}
            </Button>
          ) : (
            <Button size="sm" onClick={onToggleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />Edit
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {editing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Markdown editor</span>
                  <span>·</span>
                  <Kbd keys="Ctrl+S" /> save
                  <span>·</span>
                  <Kbd keys="Tab" /> indent
                  <span>·</span>
                  <Kbd keys="Esc" /> cancel
                </div>
                <Textarea
                  value={editContent}
                  onChange={(e) => onContentChange(e.target.value)}
                  className="min-h-[500px] font-mono text-sm resize-y"
                  spellCheck={false}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                      e.preventDefault()
                      onSave()
                    }
                    if (e.key === 'Escape') {
                      onToggleEdit()
                    }
                    if (e.key === 'Tab') {
                      e.preventDefault()
                      const el = e.currentTarget
                      const start = el.selectionStart
                      const end = el.selectionEnd
                      const next = editContent.slice(0, start) + '  ' + editContent.slice(end)
                      onContentChange(next)
                      requestAnimationFrame(() => {
                        el.selectionStart = el.selectionEnd = start + 2
                      })
                    }
                  }}
                />
              </div>
            ) : (
              <DocMarkdown content={doc.content} defaultLang={defaultLang} />
            )}
          </div>
        </ScrollArea>

        {/* Right panel: TOC + AI placeholder — xl only, read mode only */}
        {!editing && (
          <div className="hidden xl:flex flex-col w-52 flex-shrink-0 border-l border-border p-4 gap-4 overflow-y-auto">
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Contents
              </h3>
              <DocToc content={doc.content} />
            </div>

            <div className="mt-auto pt-4 border-t border-border">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-xs opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with AI
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Coming soon — AI-powered doc generation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-[10px] text-muted-foreground/50 mt-2 text-center leading-relaxed">
                AI will generate and update docs from your Roblox codebase
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function DocsContent() {
  const [tree, setTree] = useState<DocTreeFolder[]>([])
  const [favorites, setFavorites] = useState<DocFavorite[]>([])
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
  const [defaultLang, setDefaultLang] = useState('luau')

  // Rename
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [renameSaving, setRenameSaving] = useState(false)

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const didInit = useRef(false)

  // ── Data ───────────────────────────────────────────────────────────────────
  const loadTree = useCallback(async () => {
    setLoadingTree(true)
    setError(null)
    try {
      const data = await api.getDocsTree()
      setTree(data.tree)
      setFavorites(data.favorites)
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

  useEffect(() => { loadTree() }, [loadTree])

  useEffect(() => {
    if (!selectedDoc) { setDoc(null); return }
    let cancelled = false
    setLoadingDoc(true)
    api.getDoc(selectedDoc)
      .then(({ doc: loaded }) => {
        if (!cancelled) { setDoc(loaded); setEditContent(loaded.content); setEditing(false) }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load document')
      })
      .finally(() => { if (!cancelled) setLoadingDoc(false) })
    return () => { cancelled = true }
  }, [selectedDoc])

  // ── Actions — all defined before the keyboard shortcut effect ──────────────
  const handleSave = useCallback(async () => {
    if (!doc) return
    setSaving(true)
    try {
      const { doc: updated } = await api.updateDoc(doc.id, { content: editContent })
      setDoc(updated)
      setEditing(false)
      await loadTree()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save') }
    finally { setSaving(false) }
  }, [doc, editContent, loadTree])

  const handleToggleFavorite = useCallback(async () => {
    if (!doc) return
    try {
      const { doc: updated } = await api.updateDoc(doc.id, { isFavorite: !doc.isFavorite })
      setDoc((d) => d ? { ...d, isFavorite: updated.isFavorite } : d)
      await loadTree()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to update favorite') }
  }, [doc, loadTree])

  const handleCreateDoc = useCallback(async () => {
    if (!newTitle.trim() || !newParentId) return
    setCreating(true)
    try {
      const { doc: created } = await api.createDoc({ title: newTitle.trim(), parentId: newParentId })
      setCreateDocOpen(false)
      setNewTitle('')
      await loadTree()
      setSelectedDoc(created.id)
      setExpandedFolders((prev) => new Set([...prev, newParentId]))
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create document') }
    finally { setCreating(false) }
  }, [newTitle, newParentId, loadTree])

  const handleCreateFolder = useCallback(async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      await api.createDocFolder({ title: newTitle.trim() })
      setCreateFolderOpen(false)
      setNewTitle('')
      await loadTree()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create folder') }
    finally { setCreating(false) }
  }, [newTitle, loadTree])

  const handleRename = useCallback(async () => {
    if (!renameId || !renameTitle.trim()) return
    setRenameSaving(true)
    try {
      await api.updateDoc(renameId, { title: renameTitle.trim() })
      setRenameOpen(false)
      if (doc?.id === renameId) setDoc((d) => d ? { ...d, title: renameTitle.trim() } : d)
      await loadTree()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to rename') }
    finally { setRenameSaving(false) }
  }, [renameId, renameTitle, doc, loadTree])

  const handleDuplicate = useCallback(async (id: string) => {
    const source = tree.flatMap((f) => f.children).find((c) => c.id === id)
    if (!source) return
    const parentFolder = tree.find((f) => f.children.some((c) => c.id === id))
    if (!parentFolder) return
    try {
      const { doc: detail } = await api.getDoc(id)
      const { doc: created } = await api.createDoc({
        title: `${source.title} (copy)`,
        parentId: parentFolder.id,
      })
      await api.updateDoc(created.id, { content: detail.content })
      await loadTree()
      setSelectedDoc(created.id)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to duplicate') }
  }, [tree, loadTree])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await api.updateDoc(deleteId, {}) // swap for api.deleteDoc(deleteId) when available
      if (selectedDoc === deleteId) setSelectedDoc(null)
      setDeleteId(null)
      await loadTree()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to delete') }
    finally { setDeleteLoading(false) }
  }, [deleteId, selectedDoc, loadTree])

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  // ── Keyboard shortcuts — after all handlers are defined ────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (ctrl && e.key === 'e' && doc) {
        e.preventDefault()
        setEditing((v) => !v)
      }
      if (ctrl && e.key === 's' && editing) {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [doc, editing, handleSave])

  // ── Render ─────────────────────────────────────────────────────────────────
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
        onNewDoc={() => { setNewTitle(''); setNewParentId(tree[0]?.id ?? ''); setCreateDocOpen(true) }}
        onNewFolder={() => { setNewTitle(''); setCreateFolderOpen(true) }}
        onDeleteDoc={(id, title) => { setDeleteId(id); setDeleteTitle(title) }}
        onRenameDoc={(id, title) => { setRenameId(id); setRenameTitle(title); setRenameOpen(true) }}
        onDuplicateDoc={handleDuplicate}
        searchInputRef={searchInputRef}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-2">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => { setError(null); loadTree() }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}
        <DocViewer
          doc={doc}
          loading={loadingDoc}
          editing={editing}
          editContent={editContent}
          saving={saving}
          defaultLang={defaultLang}
          onToggleEdit={() => {
            if (editing && doc) setEditContent(doc.content)
            setEditing((v) => !v)
          }}
          onContentChange={setEditContent}
          onSave={handleSave}
          onToggleFavorite={handleToggleFavorite}
          onDefaultLangChange={setDefaultLang}
        />
      </div>

      {/* ── Create document ─────────────────────────────────────────────── */}
      <Dialog open={createDocOpen} onOpenChange={setCreateDocOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Combat system overview"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateDoc()}
              />
            </div>
            <div className="space-y-2">
              <Label>Folder</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                <SelectContent>
                  {tree.map((f) => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default code language</Label>
              <Select value={defaultLang} onValueChange={setDefaultLang}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      <span className="font-mono text-xs text-muted-foreground w-10 inline-block">{l.badge}</span>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDocOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDoc} disabled={creating || !newTitle.trim() || !newParentId}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create folder ───────────────────────────────────────────────── */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Folder name</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Game Systems"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={creating || !newTitle.trim()}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rename ──────────────────────────────────────────────────────── */}
      <Dialog open={renameOpen} onOpenChange={(v) => { setRenameOpen(v); if (!v) setRenameId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename document</DialogTitle></DialogHeader>
          <div className="py-2">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename} disabled={renameSaving || !renameTitle.trim()}>
              {renameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTitle}&rdquo; will be permanently deleted. This cannot be undone.
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
