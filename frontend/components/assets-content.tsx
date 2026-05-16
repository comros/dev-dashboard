'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, FolderOpen, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { WorkspaceIntegrations } from '@/lib/types'
import Link from 'next/link'

export function AssetsContent() {
  const [integrations, setIntegrations] = useState<WorkspaceIntegrations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getIntegrations()
      .then(setIntegrations)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const assetsUrl = integrations?.googleDriveAssetsUrl
  const embed = integrations?.googleDriveAssetsEmbed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-muted-foreground">
          Models, audio, UI, and textures live in your team Google Drive — we don&apos;t host files here.
        </p>
      </div>

      {!assetsUrl ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Connect your studio&apos;s asset folder in Settings (paste a shared Google Drive folder link).
            </p>
            <Button asChild>
              <Link href="/settings">Open Settings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            <Button asChild>
              <a href={assetsUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open assets in Google Drive
              </a>
            </Button>
          </div>

          {embed ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Folder preview</CardTitle>
                <CardDescription>Browse team assets without leaving the dashboard</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <iframe
                  src={embed}
                  className="w-full h-[min(70vh,600px)] border-0"
                  title="Google Drive assets"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                Use a standard Google Drive <strong>folder</strong> link in Settings for an embedded preview.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
