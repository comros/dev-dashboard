'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Github,
  CheckSquare,
  FileText,
  FolderOpen,
  Settings,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const commands = [
  { id: '1', title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: '2', title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { id: '3', title: 'GitHub', href: '/github', icon: Github },
  { id: '4', title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { id: '5', title: 'Docs', href: '/docs', icon: FileText },
  { id: '6', title: 'Assets', href: '/assets', icon: FolderOpen },
  { id: '7', title: 'Settings', href: '/settings', icon: Settings },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((cmd) => (
            <CommandItem
              key={cmd.id}
              onSelect={() => {
                router.push(cmd.href)
                setOpen(false)
              }}
            >
              <cmd.icon className="w-4 h-4 mr-2" />
              {cmd.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
