'use client';

import { useState, useEffect } from 'react';
import { Search, BarChart3, Gamepad2, Github, CheckSquare, MessageSquare, BookOpen, Palette, Wand2, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
}

const commands: Command[] = [
  { id: '1', title: 'Dashboard', description: 'Go to dashboard', icon: <Gamepad2 className="w-4 h-4" />, href: '/', category: 'Navigation' },
  { id: '2', title: 'Analytics', description: 'View game analytics', icon: <BarChart3 className="w-4 h-4" />, href: '/analytics', category: 'Navigation' },
  { id: '3', title: 'GitHub', description: 'Check GitHub integration', icon: <Github className="w-4 h-4" />, href: '/github', category: 'Navigation' },
  { id: '4', title: 'Tasks', description: 'Manage tasks and kanban', icon: <CheckSquare className="w-4 h-4" />, href: '/tasks', category: 'Navigation' },
  { id: '5', title: 'Chat', description: 'Team chat', icon: <MessageSquare className="w-4 h-4" />, href: '/chat', category: 'Navigation' },
  { id: '6', title: 'Documentation', description: 'View documentation', icon: <BookOpen className="w-4 h-4" />, href: '/docs', category: 'Navigation' },
  { id: '7', title: 'Moodboard', description: 'Inspiration board', icon: <Palette className="w-4 h-4" />, href: '/moodboard', category: 'Navigation' },
  { id: '8', title: 'Assets', description: 'Asset library', icon: <Palette className="w-4 h-4" />, href: '/assets', category: 'Navigation' },
  { id: '9', title: 'AI Tools', description: 'AI utilities', icon: <Wand2 className="w-4 h-4" />, href: '/ai-tools', category: 'Navigation' },
  { id: '10', title: 'Settings', description: 'App settings', icon: <Settings className="w-4 h-4" />, href: '/settings', category: 'Navigation' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filtered = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, cmd) => {
    const group = cmd.category;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setSearch('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <Card className="bg-secondary border border-secondary-foreground/20 w-full max-w-lg shadow-xl">
        <div className="p-4 border-b border-secondary-foreground/20 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent text-foreground focus-visible:ring-0 outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group}
              </div>
              {cmds.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.href)}
                  className="w-full text-left px-4 py-3 hover:bg-accent/20 transition-colors flex items-center gap-3 border-b border-secondary-foreground/10 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-accent">
                    {cmd.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{cmd.title}</p>
                    <p className="text-xs text-muted-foreground">{cmd.description}</p>
                  </div>
                  <kbd className="text-xs px-2 py-1 bg-background border border-secondary-foreground/20 rounded text-muted-foreground">
                    ↵
                  </kbd>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-secondary-foreground/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-2">
            <kbd className="px-2 py-1 bg-background border border-secondary-foreground/20 rounded">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="px-2 py-1 bg-background border border-secondary-foreground/20 rounded">↵</kbd>
            <span>Select</span>
            <kbd className="px-2 py-1 bg-background border border-secondary-foreground/20 rounded">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
