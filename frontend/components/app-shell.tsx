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
  Bell,
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
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, workspaces, workspaceId, setWorkspaceId, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden">
        <aside
          className={cn(
            'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
            collapsed ? 'w-16' : 'w-56'
          )}
        >
          <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              {!collapsed && (
                <span className="font-semibold text-sidebar-foreground tracking-tight">
                  rVault
                </span>
              )}
            </Link>
          </div>

          {!collapsed && workspaces.length > 1 ? (
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
          ) : null}

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const link = (
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
              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }
              return link
            })}
          </nav>

          <div className="p-2 border-t border-sidebar-border space-y-1">
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              )}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card/50">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Press</span>
              <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-xs">
                ⌘K
              </kbd>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-xs font-medium text-primary-foreground"
                title={profile?.displayName}
              >
                {profile?.avatarInitials ?? '?'}
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}