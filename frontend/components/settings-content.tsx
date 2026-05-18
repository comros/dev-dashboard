'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Save, Check, Pencil, Trash2, ExternalLink, KeyRound, User, Plug } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Experience } from '@/lib/types'

// ─── Experience row ───────────────────────────────────────────────────────────
function ExperienceRow({
  exp,
  onEdit,
  onDelete,
}: {
  exp: Experience
  onEdit: (exp: Experience) => void
  onDelete: (exp: Experience) => void
}) {
  const statusColor: Record<Experience['status'], string> = {
    live: 'bg-success/15 text-success border-success/30',
    development: 'bg-primary/10 text-primary border-primary/30',
    maintenance: 'bg-warning/15 text-warning border-warning/30',
    archived: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-xs font-bold text-muted-foreground shrink-0">
          {exp.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{exp.name}</p>
          {exp.robloxUniverseId ? (
            <p className="text-xs text-muted-foreground">Universe {exp.robloxUniverseId}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Badge variant="outline" className={statusColor[exp.status]}>
          {exp.status}
        </Badge>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(exp)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(exp)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SettingsContent() {
  const { profile, workspaces, workspaceId, refresh } = useAuth()
  const ws = workspaces.find((w) => w.id === workspaceId)

  // Integration fields
  const [driveAssets, setDriveAssets] = useState('')
  const [driveDocsFolder, setDriveDocsFolder] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [discordUrl, setDiscordUrl] = useState('')
  const [integSaving, setIntegSaving] = useState(false)
  const [integSaved, setIntegSaved] = useState(false)
  const [integError, setIntegError] = useState<string | null>(null)

  // Experience state
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [expLoading, setExpLoading] = useState(false)

  // Create / edit experience dialog
  const [expDialogOpen, setExpDialogOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)
  const [expName, setExpName] = useState('')
  const [expUniverse, setExpUniverse] = useState('')
  const [expPlaceId, setExpPlaceId] = useState('')
  const [expStatus, setExpStatus] = useState<Experience['status']>('development')
  const [expSaving, setExpSaving] = useState(false)

  // Delete exp dialog
  const [deleteExp, setDeleteExp] = useState<Experience | null>(null)

  // Load from workspace object on mount / workspace change
  useEffect(() => {
    if (ws) {
      setDriveAssets(ws.googleDriveAssetsUrl ?? '')
      setDriveDocsFolder(ws.googleDriveDocsFolderId ?? '')
      setGithubRepo(ws.githubRepo ?? '')
      setDiscordUrl(ws.discordInviteUrl ?? '')
    }
    setExpLoading(true)
    api.getExperiences().then((r) => setExperiences(r.experiences)).catch(() => {}).finally(() => setExpLoading(false))
  }, [ws])

  // ── Save integrations ──────────────────────────────────────────────────────
  const saveIntegrations = async () => {
    if (integSaving) return
    setIntegSaving(true)
    setIntegSaved(false)
    setIntegError(null)
    try {
      await api.updateWorkspace({
        googleDriveAssetsUrl: driveAssets.trim() || null,
        googleDriveDocsFolderId: driveDocsFolder.trim() || null,
        githubRepo: githubRepo.trim() || null,
        discordInviteUrl: discordUrl.trim() || null,
      })
      // Refresh auth context so workspace data reflects the new values on next mount
      await refresh()
      setIntegSaved(true)
      setTimeout(() => setIntegSaved(false), 3000)
    } catch (e) {
      setIntegError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setIntegSaving(false)
    }
  }

  const handleIntegKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveIntegrations()
  }

  // ── Open create / edit dialog ──────────────────────────────────────────────
  const openExpDialog = (exp?: Experience) => {
    setEditingExp(exp ?? null)
    setExpName(exp?.name ?? '')
    setExpUniverse(exp?.robloxUniverseId ?? '')
    setExpPlaceId(exp?.robloxPlaceId ?? '')
    setExpStatus(exp?.status ?? 'development')
    setExpDialogOpen(true)
  }

  // ── Create / edit experience ───────────────────────────────────────────────
  const saveExperience = async () => {
    if (!expName.trim()) return
    setExpSaving(true)
    try {
      const { experience } = await api.createExperience({
        name: expName.trim(),
        robloxUniverseId: expUniverse || undefined,
        robloxPlaceId: expPlaceId || undefined,
        status: expStatus,
      })
      if (editingExp) {
        setExperiences((prev) => prev.map((e) => (e.id === editingExp.id ? experience : e)))
      } else {
        setExperiences((prev) => [...prev, experience])
      }
      setExpDialogOpen(false)
    } finally {
      setExpSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Workspace integrations and team configuration</p>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="integrations">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="experiences">
            Experiences
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* ── Integrations ─────────────────────────────────────────────────── */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Google Drive</CardTitle>
              <CardDescription>
                Assets and docs stay in your team Drive. Paste a shared folder link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assets folder URL</Label>
                <Input
                  value={driveAssets}
                  onChange={(e) => { setDriveAssets(e.target.value); setIntegSaved(false) }}
                  onKeyDown={handleIntegKeyDown}
                  placeholder="https://drive.google.com/drive/folders/…"
                />
                <p className="text-xs text-muted-foreground">
                  Paste a shared Google Drive folder link. It will be embedded in the Assets page.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Docs folder ID</Label>
                <Input
                  value={driveDocsFolder}
                  onChange={(e) => { setDriveDocsFolder(e.target.value); setIntegSaved(false) }}
                  onKeyDown={handleIntegKeyDown}
                  placeholder="Google Drive folder ID for .md docs"
                />
                <p className="text-xs text-muted-foreground">
                  Optional — used for future Drive sync. Docs are stored in Supabase.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub</CardTitle>
              <CardDescription>
                Connect your repository to show recent commits and contribution stats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Repository</Label>
                <Input
                  value={githubRepo}
                  onChange={(e) => { setGithubRepo(e.target.value); setIntegSaved(false) }}
                  onKeyDown={handleIntegKeyDown}
                  placeholder="your-org/roblox-game"
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">GitHub token</p>
                <p>Add <code className="text-xs bg-muted px-1 rounded">GITHUB_TOKEN</code> to your backend <code className="text-xs bg-muted px-1 rounded">.env</code> file to enable commit syncing.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discord</CardTitle>
              <CardDescription>Team communication — shown as a quick link across the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Team invite link</Label>
                <Input
                  value={discordUrl}
                  onChange={(e) => { setDiscordUrl(e.target.value); setIntegSaved(false) }}
                  onKeyDown={handleIntegKeyDown}
                  placeholder="https://discord.gg/…"
                />
              </div>
            </CardContent>
          </Card>

          {integError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {integError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={saveIntegrations} disabled={integSaving}>
              {integSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : integSaved ? (
                <><Check className="w-4 h-4 mr-2" />Saved</>
              ) : (
                <><Save className="w-4 h-4 mr-2" />Save integrations</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">or press Enter in any field</p>
            {integSaved && (
              <span className="text-sm text-success flex items-center gap-1.5 ml-auto">
                <Check className="w-3.5 h-3.5" /> All changes saved
              </span>
            )}
          </div>
        </TabsContent>

        {/* ── Experiences ──────────────────────────────────────────────────── */}
        <TabsContent value="experiences" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Roblox Experiences</CardTitle>
                  <CardDescription>Games / universes your studio is building</CardDescription>
                </div>
                <Button size="sm" onClick={() => openExpDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add experience
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {expLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No experiences yet. Click &ldquo;Add experience&rdquo; to get started.
                </div>
              ) : (
                <div>
                  {experiences.map((exp) => (
                    <ExperienceRow
                      key={exp.id}
                      exp={exp}
                      onEdit={openExpDialog}
                      onDelete={setDeleteExp}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ─────────────────────────────────────────────────────── */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Token Management</CardTitle>
              <CardDescription>Best practices for securing your GitHub and API tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="font-medium text-destructive mb-1">Current issue: plaintext GitHub token in <code>.env</code></p>
                <p className="text-muted-foreground">
                  A GitHub PAT stored in <code>.env</code> is compromised if the repo is shared or leaked.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-medium">Recommended production approach:</p>
                <div className="space-y-2 pl-1">
                  {[
                    { step: '1', title: 'Use a secrets manager', desc: 'Store tokens in Supabase Vault, AWS Secrets Manager, Doppler, or Infisical — not in .env files.' },
                    { step: '2', title: 'Store encrypted in database', desc: 'The schema already has github_token_encrypted on workspaces. Encrypt with AES-256-GCM before storing, decrypt server-side.' },
                    { step: '3', title: 'Rotate tokens frequently', desc: 'Use fine-grained GitHub PATs scoped only to the required repos, with an expiry date.' },
                    { step: '4', title: 'Audit access', desc: 'Log every decryption. Alert on unexpected access patterns.' },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">{step}</div>
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/docs/guides/database/vault" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Supabase Vault docs
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {profile?.avatarInitials ?? '?'}
                </div>
                <div>
                  <p className="font-semibold">{profile?.displayName ?? '—'}</p>
                  {profile?.robloxUsername ? (
                    <p className="text-sm text-muted-foreground">@{profile.robloxUsername} on Roblox</p>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Workspace</p>
                  <p className="font-medium">{ws?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Role</p>
                  <p className="font-medium capitalize">{ws?.role ?? '—'}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                To update your display name or Roblox username, use the Supabase Auth dashboard.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Experience create/edit dialog ─────────────────────────────────────── */}
      <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExp ? 'Edit experience' : 'Add experience'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                placeholder="My Roblox Game"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveExperience()}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Universe ID</Label>
                <Input value={expUniverse} onChange={(e) => setExpUniverse(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Place ID</Label>
                <Input value={expPlaceId} onChange={(e) => setExpPlaceId(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={expStatus} onValueChange={(v) => setExpStatus(v as Experience['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveExperience} disabled={expSaving || !expName.trim()}>
              {expSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingExp ? 'Save changes' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete experience confirmation ───────────────────────────────────── */}
      <AlertDialog open={!!deleteExp} onOpenChange={(v) => !v && setDeleteExp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete experience?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteExp?.name}&rdquo; and all associated analytics data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (deleteExp) {
                  setExperiences((prev) => prev.filter((e) => e.id !== deleteExp.id))
                  setDeleteExp(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
