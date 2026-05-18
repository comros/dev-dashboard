'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Github,
  CheckSquare,
  FileText,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Search,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CommandPalette } from '@/components/command-palette'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/github', icon: Github, label: 'GitHub' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/docs', icon: FileText, label: 'Docs' },
  { href: '/assets', icon: FolderOpen, label: 'Assets' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const mainNavItems = navItems.filter((item) => item.href !== '/settings')

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, workspaces, workspaceId, setWorkspaceId, signOut } = useAuth()

  const currentPage = navItems.find((item) => item.href === pathname) ?? null
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const navLink = (item: (typeof navItems)[0]) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  const withTooltip = (item: (typeof navItems)[0], node: React.ReactNode) =>
    collapsed ? (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{node as React.ReactElement}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    ) : (
      node
    )

  return (
    <TooltipProvider delayDuration={0}>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden">
        {/* ── Sidebar ── */}
        <aside
          className={cn(
            'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
            collapsed ? 'w-16' : 'w-56'
          )}
        >
          {/* Logo + workspace name */}
          <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-semibold text-sidebar-foreground tracking-tight block leading-tight">
                    rVault
                  </span>
                  {currentWorkspace && (
                    <span className="text-[10px] text-muted-foreground truncate block leading-tight">
                      {currentWorkspace.name}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </div>

          {/* Workspace selector (only when multiple) */}
          {!collapsed && workspaces.length > 1 && (
            <div className="p-2 border-b border-sidebar-border">
              <Select value={workspaceId ?? undefined} onValueChange={setWorkspaceId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Studio" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Main nav */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {mainNavItems.map((item) => withTooltip(item, navLink(item)))}
          </nav>

          {/* Bottom section */}
          <div className="p-2 border-t border-sidebar-border space-y-0.5">
            {/* User profile card */}
            {profile && (
              collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center py-1.5 cursor-default">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                        {profile.avatarInitials}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{profile.displayName}</p>
                    {profile.robloxUsername && (
                      <p className="text-xs text-muted-foreground">@{profile.robloxUsername}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-md bg-sidebar-accent/30 mb-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0">
                    {profile.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">
                      {profile.displayName}
                    </p>
                    {profile.robloxUsername && (
                      <p className="text-[11px] text-muted-foreground truncate leading-tight">
                        @{profile.robloxUsername}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Settings */}
            {withTooltip({ href: '/settings', icon: Settings, label: 'Settings' }, navLink({ href: '/settings', icon: Settings, label: 'Settings' }))}

            {/* Sign out */}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex justify-center h-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 px-3 h-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 font-medium"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign out</span>
              </Button>
            )}

            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-muted-foreground hover:text-foreground mt-1"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card/50">
            {/* Page title breadcrumb */}
            <div className="flex items-center gap-2.5">
              {currentPage && (
                <>
                  <currentPage.icon className="w-4 h-4 text-muted-foreground" />
                  <h1 className="text-sm font-semibold text-foreground">{currentPage.label}</h1>
                </>
              )}
            </div>

            {/* Right: search hint + user avatar */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-md px-2.5 py-1 border border-border/50 select-none">
                <Search className="w-3.5 h-3.5" />
                <span>⌘K</span>
              </div>
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-xs font-medium text-primary-foreground"
                title={profile?.displayName}
              >
                {profile?.avatarInitials ?? '?'}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
