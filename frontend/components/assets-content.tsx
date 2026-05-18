'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, FolderOpen, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { WorkspaceIntegrations } from '@/lib/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AssetsContent() {
  const [integrations, setIntegrations] = useState<WorkspaceIntegrations | null>(null)
  const [loading, setLoading] = useState(true)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    api
      .getIntegrations()
      .then(setIntegrations)
      .finally(() => setLoading(false))
  }, [])

  // Reset iframe state when URL changes
  useEffect(() => {
    setIframeLoading(true)
    setIframeError(false)
  }, [integrations?.googleDriveAssetsEmbed])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const assetsUrl = integrations?.googleDriveAssetsUrl
  const embed = integrations?.googleDriveAssetsEmbed

  // Not configured at all
  if (!assetsUrl) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Models, audio, UI, and textures — link your team Google Drive folder.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-5" />
            <h3 className="text-base font-semibold mb-1">No asset folder linked</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Paste a shared Google Drive folder link in Settings to browse your team&apos;s assets here.
            </p>
            <Button asChild>
              <Link href="/settings">Open Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-muted-foreground">
          Models, audio, UI, and textures — your team Google Drive folder.
        </p>
      </div>

      {/* Primary action: open in Drive */}
      <div className="flex items-center gap-3">
        <Button asChild size="sm">
          <a href={assetsUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Google Drive
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">Opens in a new tab</p>
      </div>

      {/* Embedded preview */}
      {embed ? (
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="py-3 px-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Folder preview</CardTitle>
                <CardDescription className="text-xs mt-0.5">Browse team assets without leaving the dashboard</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5">
                <a href={assetsUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open full view
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative">
            {/* Spinner while loading */}
            {iframeLoading && !iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading Drive folder…</p>
              </div>
            )}

            {/* Error state */}
            {iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 gap-4 px-6 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Could not load the preview</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Drive may be blocking the embed. Open it directly instead.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setIframeError(false); setIframeLoading(true); if (iframeRef.current) iframeRef.current.src = embed }}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Retry
                  </Button>
                  <Button size="sm" asChild>
                    <a href={assetsUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Open in Drive
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={embed}
              className={cn(
                'w-full border-0 transition-opacity duration-300',
                iframeLoading || iframeError ? 'opacity-0 h-0' : 'opacity-100'
              )}
              style={{ height: iframeLoading || iframeError ? 0 : 'min(70vh, 620px)' }}
              title="Google Drive assets"
              onLoad={() => setIframeLoading(false)}
              onError={() => { setIframeLoading(false); setIframeError(true) }}
            />
          </CardContent>
        </Card>
      ) : (
        /* Has URL but no embed (e.g. file share, not folder) */
        <Card className="border-dashed border-border/60">
          <CardContent className="py-8 px-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-muted-foreground/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Preview not available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Embedded preview requires a standard Google Drive <strong>folder</strong> link (not a file or shortcut).
                Update the link in{' '}
                <Link href="/settings" className="text-primary hover:underline">Settings</Link>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
