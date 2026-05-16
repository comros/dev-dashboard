'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Link,
  FolderOpen,
  Folder,
  File,
  BookOpen,
  Gamepad2,
  Palette,
  Volume2,
  Code,
  Settings,
} from 'lucide-react'
import { teamMembers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// Extended documentation structure
const docStructure = [
  {
    id: '1',
    title: 'Getting Started',
    icon: BookOpen,
    children: [
      { id: '1-1', title: 'Quick Start Guide', lastEdited: '2 days ago', editedBy: teamMembers[0] },
      { id: '1-2', title: 'Development Setup', lastEdited: '1 week ago', editedBy: teamMembers[4] },
      { id: '1-3', title: 'Team Onboarding', lastEdited: '3 days ago', editedBy: teamMembers[1] },
    ],
  },
  {
    id: '2',
    title: 'Game Design',
    icon: Gamepad2,
    children: [
      { id: '2-1', title: 'Combat System', lastEdited: '2 hours ago', editedBy: teamMembers[0] },
      { id: '2-2', title: 'Character Abilities', lastEdited: '1 day ago', editedBy: teamMembers[1] },
      { id: '2-3', title: 'Level Design Guidelines', lastEdited: '4 days ago', editedBy: teamMembers[1] },
      { id: '2-4', title: 'Economy & Progression', lastEdited: '5 days ago', editedBy: teamMembers[1] },
    ],
  },
  {
    id: '3',
    title: 'Art & Design',
    icon: Palette,
    children: [
      { id: '3-1', title: 'Art Style Guide', lastEdited: '3 days ago', editedBy: teamMembers[2] },
      { id: '3-2', title: 'Character Design', lastEdited: '1 week ago', editedBy: teamMembers[2] },
      { id: '3-3', title: 'Environment Design', lastEdited: '2 weeks ago', editedBy: teamMembers[2] },
      { id: '3-4', title: 'UI/UX Guidelines', lastEdited: '4 days ago', editedBy: teamMembers[3] },
    ],
  },
  {
    id: '4',
    title: 'Audio',
    icon: Volume2,
    children: [
      { id: '4-1', title: 'Audio Guidelines', lastEdited: '1 week ago', editedBy: teamMembers[5] },
      { id: '4-2', title: 'Sound Effects Library', lastEdited: '3 days ago', editedBy: teamMembers[5] },
      { id: '4-3', title: 'Music Direction', lastEdited: '5 days ago', editedBy: teamMembers[5] },
    ],
  },
  {
    id: '5',
    title: 'Technical',
    icon: Code,
    children: [
      { id: '5-1', title: 'Code Standards', lastEdited: '1 day ago', editedBy: teamMembers[0] },
      { id: '5-2', title: 'API Documentation', lastEdited: '2 days ago', editedBy: teamMembers[4] },
      { id: '5-3', title: 'Database Schema', lastEdited: '3 days ago', editedBy: teamMembers[4] },
      { id: '5-4', title: 'Performance Guidelines', lastEdited: '1 week ago', editedBy: teamMembers[0] },
    ],
  },
]

const recentDocs = [
  { id: '2-1', title: 'Combat System', folder: 'Game Design', editedBy: teamMembers[0], editedAt: '2 hours ago' },
  { id: '5-1', title: 'Code Standards', folder: 'Technical', editedBy: teamMembers[0], editedAt: '1 day ago' },
  { id: '3-1', title: 'Art Style Guide', folder: 'Art & Design', editedBy: teamMembers[2], editedAt: '3 days ago' },
  { id: '1-3', title: 'Team Onboarding', folder: 'Getting Started', editedBy: teamMembers[1], editedAt: '3 days ago' },
]

const favoriteDocs = [
  { id: '2-1', title: 'Combat System', folder: 'Game Design' },
  { id: '5-1', title: 'Code Standards', folder: 'Technical' },
  { id: '3-4', title: 'UI/UX Guidelines', folder: 'Art & Design' },
]

// Sample document content
const documentContent = {
  '2-1': {
    title: 'Combat System',
    lastEdited: '2 hours ago',
    editedBy: teamMembers[0],
    content: `
# Combat System Documentation

## Overview

The combat system in Dragon Realm is designed to be fluid, responsive, and deeply strategic. Players engage in real-time combat using a combination of basic attacks, special abilities, and defensive maneuvers.

## Core Mechanics

### Basic Attacks
- **Light Attack**: Quick strikes with low damage but fast recovery
- **Heavy Attack**: Powerful strikes with high damage but slow recovery
- **Combo System**: Chain up to 5 attacks for bonus damage

### Special Abilities
Each character class has access to 4 unique abilities:
1. **Primary Skill** - Low cooldown, moderate damage
2. **Secondary Skill** - Medium cooldown, utility focused
3. **Ultimate Ability** - High cooldown, devastating damage
4. **Passive Skill** - Always active, provides stat bonuses

### Defense Mechanics
- **Block**: Reduces incoming damage by 50%
- **Dodge Roll**: I-frames for 0.3 seconds
- **Parry**: Timing-based, reflects damage back

## Damage Calculation

\`\`\`lua
local function CalculateDamage(attacker, defender, baseDamage)
    local attackPower = attacker.Stats.Attack
    local defense = defender.Stats.Defense
    local critChance = attacker.Stats.CritRate
    
    local damage = baseDamage * (attackPower / (attackPower + defense))
    
    if math.random() < critChance then
        damage = damage * 1.5 -- Critical hit
    end
    
    return math.floor(damage)
end
\`\`\`

## Animation States

| State | Duration | Can Cancel |
|-------|----------|------------|
| Idle | - | Yes |
| Light Attack | 0.4s | After 0.2s |
| Heavy Attack | 0.8s | After 0.5s |
| Dodge | 0.5s | No |
| Block | - | Yes |

## Implementation Notes

- All combat actions should feel responsive (< 100ms input lag)
- Hitboxes are generated dynamically based on weapon type
- Network reconciliation uses server-authoritative model
    `,
  },
}

function DocSidebar({
  selectedDoc,
  onSelectDoc,
  expandedFolders,
  onToggleFolder,
}: {
  selectedDoc: string | null
  onSelectDoc: (id: string) => void
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
}) {
  return (
    <div className="w-64 flex-shrink-0 border-r border-border flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Documentation</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search docs..." className="pl-9 h-8 text-sm" />
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-warning" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Favorites
          </span>
        </div>
        <div className="space-y-0.5">
          {favoriteDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                selectedDoc === doc.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left truncate">{doc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Doc Tree */}
      <ScrollArea className="flex-1 px-3">
        <div className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              All Documents
            </span>
          </div>
          <div className="space-y-0.5">
            {docStructure.map((folder) => {
              const Icon = folder.icon
              const isExpanded = expandedFolders.has(folder.id)

              return (
                <div key={folder.id}>
                  <button
                    onClick={() => onToggleFolder(folder.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{folder.title}</span>
                    <Badge variant="secondary" className="text-xs h-5">
                      {folder.children.length}
                    </Badge>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 pl-2 border-l border-sidebar-border space-y-0.5 mt-0.5">
                      {folder.children.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => onSelectDoc(doc.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                            selectedDoc === doc.id
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          )}
                        >
                          <File className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 text-left truncate">{doc.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function DocViewer({ docId }: { docId: string | null }) {
  if (!docId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Select a document</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a document from the sidebar to view its contents
          </p>
        </div>
      </div>
    )
  }

  const doc = documentContent['2-1'] // Default to combat system for demo

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Doc header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold">{doc.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>Last edited {doc.lastEdited}</span>
            <span>by</span>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                {doc.editedBy.avatar}
              </div>
              <span>{doc.editedBy.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Star className="w-4 h-4 mr-2" />
            Favorite
          </Button>
          <Button variant="outline" size="sm">
            <Link className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Doc content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="prose prose-invert prose-sm max-w-none">
            {/* Render markdown-like content */}
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Combat System Documentation</h1>
              
              <h2 className="text-xl font-semibold mt-8">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                The combat system in Dragon Realm is designed to be fluid, responsive, and deeply strategic.
                Players engage in real-time combat using a combination of basic attacks, special abilities, and defensive maneuvers.
              </p>

              <h2 className="text-xl font-semibold mt-8">Core Mechanics</h2>
              
              <h3 className="text-lg font-medium mt-6">Basic Attacks</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Light Attack</strong>: Quick strikes with low damage but fast recovery</li>
                <li><strong className="text-foreground">Heavy Attack</strong>: Powerful strikes with high damage but slow recovery</li>
                <li><strong className="text-foreground">Combo System</strong>: Chain up to 5 attacks for bonus damage</li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Special Abilities</h3>
              <p className="text-muted-foreground">Each character class has access to 4 unique abilities:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">Primary Skill</strong> - Low cooldown, moderate damage</li>
                <li><strong className="text-foreground">Secondary Skill</strong> - Medium cooldown, utility focused</li>
                <li><strong className="text-foreground">Ultimate Ability</strong> - High cooldown, devastating damage</li>
                <li><strong className="text-foreground">Passive Skill</strong> - Always active, provides stat bonuses</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">Defense Mechanics</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Block</strong>: Reduces incoming damage by 50%</li>
                <li><strong className="text-foreground">Dodge Roll</strong>: I-frames for 0.3 seconds</li>
                <li><strong className="text-foreground">Parry</strong>: Timing-based, reflects damage back</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8">Damage Calculation</h2>
              <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-muted-foreground">
{`local function CalculateDamage(attacker, defender, baseDamage)
    local attackPower = attacker.Stats.Attack
    local defense = defender.Stats.Defense
    local critChance = attacker.Stats.CritRate
    
    local damage = baseDamage * (attackPower / (attackPower + defense))
    
    if math.random() < critChance then
        damage = damage * 1.5 -- Critical hit
    end
    
    return math.floor(damage)
end`}
                </pre>
              </div>

              <h2 className="text-xl font-semibold mt-8">Animation States</h2>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">State</th>
                      <th className="px-4 py-2 text-left font-medium">Duration</th>
                      <th className="px-4 py-2 text-left font-medium">Can Cancel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2">Idle</td>
                      <td className="px-4 py-2 text-muted-foreground">-</td>
                      <td className="px-4 py-2 text-success">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Light Attack</td>
                      <td className="px-4 py-2 text-muted-foreground">0.4s</td>
                      <td className="px-4 py-2 text-muted-foreground">After 0.2s</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Heavy Attack</td>
                      <td className="px-4 py-2 text-muted-foreground">0.8s</td>
                      <td className="px-4 py-2 text-muted-foreground">After 0.5s</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Dodge</td>
                      <td className="px-4 py-2 text-muted-foreground">0.5s</td>
                      <td className="px-4 py-2 text-destructive">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Block</td>
                      <td className="px-4 py-2 text-muted-foreground">-</td>
                      <td className="px-4 py-2 text-success">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-semibold mt-8">Implementation Notes</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All combat actions should feel responsive ({'<'} 100ms input lag)</li>
                <li>Hitboxes are generated dynamically based on weapon type</li>
                <li>Network reconciliation uses server-authoritative model</li>
              </ul>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export function DocsContent() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>('2-1')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['2']))

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  return (
    <div className="flex h-full -m-6">
      <DocSidebar
        selectedDoc={selectedDoc}
        onSelectDoc={setSelectedDoc}
        expandedFolders={expandedFolders}
        onToggleFolder={toggleFolder}
      />
      <DocViewer docId={selectedDoc} />

      {/* Table of Contents */}
      <div className="w-56 flex-shrink-0 border-l border-border p-4 hidden xl:block">
        <h3 className="font-semibold text-sm mb-3">On this page</h3>
        <nav className="space-y-1">
          {[
            'Overview',
            'Core Mechanics',
            'Basic Attacks',
            'Special Abilities',
            'Defense Mechanics',
            'Damage Calculation',
            'Animation States',
            'Implementation Notes',
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className={cn(
                'block text-sm py-1 transition-colors',
                i === 0 ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground',
                (item === 'Basic Attacks' || item === 'Special Abilities' || item === 'Defense Mechanics') && 'pl-3'
              )}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-border">
          <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentDocs.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground flex-shrink-0">
                  {doc.editedBy.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.editedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
