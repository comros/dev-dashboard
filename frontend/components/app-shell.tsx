'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Github,
  CheckSquare,
  MessageSquare,
  FileText,
  Image,
  FolderOpen,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Bell,
  Search,
  Command,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CommandPalette } from '@/components/command-palette'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/github', icon: Github, label: 'GitHub' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/chat', icon: MessageSquare, label: 'Team Chat' },
  { href: '/docs', icon: FileText, label: 'Docs' },
  { href: '/moodboard', icon: Image, label: 'Moodboard' },
  { href: '/assets', icon: FolderOpen, label: 'Assets' },
  { href: '/ai-tools', icon: Sparkles, label: 'AI Tools' },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
            collapsed ? 'w-16' : 'w-56'
          )}
        >
          {/* Logo */}
          <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
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

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const NavLink = (
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
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return NavLink
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-2 border-t border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>Settings</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="font-medium">
                  Settings
                </TooltipContent>
              )}
            </Tooltip>

            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card/50">
            {/* Command bar trigger */}
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Press</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
              <span>to search</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-sm font-medium text-primary-foreground">
                JD
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
