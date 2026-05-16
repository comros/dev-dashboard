'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Image,
  Link,
  MoreHorizontal,
  Grid,
  LayoutGrid,
  Heart,
  ExternalLink,
  Palette,
  Download,
  Tag,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Moodboard inspiration items
const moodboardItems = [
  {
    id: '1',
    type: 'image',
    title: 'Dragon Character Concept',
    image: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=400&h=300&fit=crop',
    tags: ['character', 'dragon', 'concept'],
    saved: true,
    addedBy: 'John Doe',
    addedAt: '2 days ago',
  },
  {
    id: '2',
    type: 'image',
    title: 'Fantasy Forest Environment',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
    tags: ['environment', 'forest', 'nature'],
    saved: false,
    addedBy: 'Mike Ross',
    addedAt: '3 days ago',
  },
  {
    id: '3',
    type: 'color',
    title: 'Primary Color Palette',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483'],
    tags: ['colors', 'palette', 'ui'],
    saved: true,
    addedBy: 'Emma Wilson',
    addedAt: '1 week ago',
  },
  {
    id: '4',
    type: 'image',
    title: 'UI Inspiration - Dashboard',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    tags: ['ui', 'dashboard', 'dark'],
    saved: false,
    addedBy: 'Emma Wilson',
    addedAt: '4 days ago',
  },
  {
    id: '5',
    type: 'image',
    title: 'Magic Effects Reference',
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=300&fit=crop',
    tags: ['vfx', 'magic', 'particles'],
    saved: true,
    addedBy: 'Sarah Chen',
    addedAt: '5 days ago',
  },
  {
    id: '6',
    type: 'image',
    title: 'Medieval Architecture',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop',
    tags: ['architecture', 'medieval', 'castle'],
    saved: false,
    addedBy: 'Mike Ross',
    addedAt: '1 week ago',
  },
  {
    id: '7',
    type: 'color',
    title: 'Enemy Color Scheme',
    colors: ['#2d132c', '#801336', '#c72c41', '#ee4540', '#f0a500'],
    tags: ['colors', 'enemy', 'danger'],
    saved: false,
    addedBy: 'Emma Wilson',
    addedAt: '3 days ago',
  },
  {
    id: '8',
    type: 'image',
    title: 'Weapon Design Reference',
    image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&h=300&fit=crop',
    tags: ['weapon', 'sword', 'design'],
    saved: true,
    addedBy: 'Sarah Chen',
    addedAt: '6 days ago',
  },
]

const boards = [
  { id: 'all', name: 'All Items', count: moodboardItems.length },
  { id: 'dragon-realm', name: 'Dragon Realm', count: 5 },
  { id: 'ui-design', name: 'UI Design', count: 3 },
  { id: 'characters', name: 'Characters', count: 4 },
  { id: 'environments', name: 'Environments', count: 3 },
]

function MoodboardCard({ item }: { item: (typeof moodboardItems)[0] }) {
  const [isSaved, setIsSaved] = useState(item.saved)

  return (
    <Card className="py-0 overflow-hidden group hover:border-primary/30 transition-colors">
      {item.type === 'image' ? (
        <div className="relative aspect-[4/3] bg-secondary">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className={cn('w-4 h-4', isSaved && 'fill-destructive text-destructive')} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="aspect-[4/3] p-4 flex flex-col">
          <div className="flex-1 grid grid-cols-5 gap-1 rounded-lg overflow-hidden">
            {item.colors?.map((color, i) => (
              <div key={i} className="h-full" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="mt-3 flex gap-1 flex-wrap">
            {item.colors?.map((color, i) => (
              <code key={i} className="text-xs text-muted-foreground">{color}</code>
            ))}
          </div>
        </div>
      )}
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{item.title}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
          <span>{item.addedBy}</span>
          <span>{item.addedAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function MoodboardContent() {
  const [selectedBoard, setSelectedBoard] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = [...new Set(moodboardItems.flatMap((item) => item.tags))]

  const filteredItems = moodboardItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => item.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Moodboard</h1>
          <p className="text-muted-foreground">Collect and organize visual inspiration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link className="w-4 h-4 mr-2" />
            Add URL
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Boards */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {boards.map((board) => (
          <Button
            key={board.id}
            variant={selectedBoard === board.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBoard(board.id)}
          >
            {board.name}
            <Badge
              variant="secondary"
              className={cn(
                'ml-2 text-xs',
                selectedBoard === board.id && 'bg-primary-foreground/20 text-primary-foreground'
              )}
            >
              {board.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search inspiration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {allTags.slice(0, 6).map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag))
                } else {
                  setSelectedTags([...selectedTags, tag])
                }
              }}
            >
              {tag}
              {selectedTags.includes(tag) && <X className="w-3 h-3 ml-1" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <MoodboardCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Image className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No inspiration found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
