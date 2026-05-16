'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Save } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Experience } from '@/lib/types'

export function SettingsContent() {
  const { profile, workspaces, workspaceId } = useAuth()
  const ws = workspaces.find((w) => w.id === workspaceId)

  const [driveAssets, setDriveAssets] = useState('')
  const [driveDocsFolder, setDriveDocsFolder] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [discordUrl, setDiscordUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [expName, setExpName] = useState('')
  const [expUniverse, setExpUniverse] = useState('')
  const [expLoading, setExpLoading] = useState(false)

  useEffect(() => {
    if (ws) {
      setDriveAssets(ws.googleDriveAssetsUrl ?? '')
      setDriveDocsFolder(ws.googleDriveDocsFolderId ?? '')
      setGithubRepo(ws.githubRepo ?? '')
      setDiscordUrl(ws.discordInviteUrl ?? '')
    }
    api.getExperiences().then((r) => setExperiences(r.experiences)).catch(() => {})
  }, [ws])

  const saveIntegrations = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.updateWorkspace({
        googleDriveAssetsUrl: driveAssets || null,
        googleDriveDocsFolderId: driveDocsFolder || null,
        githubRepo: githubRepo || null,
        discordInviteUrl: discordUrl || null,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const addExperience = async () => {
    if (!expName.trim()) return
    setExpLoading(true)
    try {
      const { experience } = await api.createExperience({
        name: expName.trim(),
        robloxUniverseId: expUniverse || undefined,
      })
      setExperiences((e) => [...e, experience])
      setExpName('')
      setExpUniverse('')
    } finally {
      setExpLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Studio integrations for {profile?.displayName ?? 'your account'}
        </p>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="experiences">Experiences</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Google Drive</CardTitle>
              <CardDescription>
                Assets and docs stay in your team Drive. Paste shared folder links or folder IDs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assets folder URL</Label>
                <Input
                  value={driveAssets}
                  onChange={(e) => setDriveAssets(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Docs folder ID</Label>
                <Input
                  value={driveDocsFolder}
                  onChange={(e) => setDriveDocsFolder(e.target.value)}
                  placeholder="Google Drive folder ID for .md docs"
                />
                <p className="text-xs text-muted-foreground">
                  Markdown is stored in the database; use this folder ID when you sync to Drive manually or via a future integration.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub &amp; Discord</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>GitHub repository</Label>
                <Input
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="your-org/roblox-game"
                />
              </div>
              <div className="space-y-2">
                <Label>Discord invite (team chat)</Label>
                <Input
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.gg/..."
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveIntegrations} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save integrations
          </Button>
          {saved ? <p className="text-sm text-success">Saved.</p> : null}
        </TabsContent>

        <TabsContent value="experiences" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roblox experiences</CardTitle>
              <CardDescription>Games / universes your studio is building</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {experiences.map((e) => (
                  <li key={e.id} className="text-sm flex justify-between border-b border-border pb-2">
                    <span className="font-medium">{e.name}</span>
                    <span className="text-muted-foreground">{e.status}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Experience name"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                />
                <Input
                  placeholder="Universe ID (optional)"
                  value={expUniverse}
                  onChange={(e) => setExpUniverse(e.target.value)}
                />
              </div>
              <Button onClick={addExperience} disabled={expLoading || !expName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add experience
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">Name:</span> {profile?.displayName}
              </p>
              <p>
                <span className="text-muted-foreground">Roblox:</span>{' '}
                {profile?.robloxUsername ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Workspace:</span> {ws?.name ?? '—'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
