'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Hash,
  Send,
  Plus,
  Search,
  Settings,
  Smile,
  Paperclip,
  AtSign,
  Pin,
  MoreHorizontal,
  Bell,
  BellOff,
  Users,
  Volume2,
  Image,
  File,
} from 'lucide-react'
import { chatChannels, chatMessages, teamMembers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// Extended chat messages for the demo
const extendedMessages = [
  {
    id: '1',
    content: 'Good morning everyone! Ready for our weekly sync?',
    author: teamMembers[0],
    timestamp: '9:00 AM',
    channel: 'general',
  },
  {
    id: '2',
    content: 'Morning! Yes, just finishing up some code reviews.',
    author: teamMembers[4],
    timestamp: '9:05 AM',
    channel: 'general',
  },
  {
    id: '3',
    content: 'Hey team, the new combat system is looking great! Check out the latest build.',
    author: teamMembers[0],
    timestamp: '10:30 AM',
    channel: 'general',
    reactions: [{ emoji: '🔥', count: 3 }, { emoji: '👍', count: 5 }],
  },
  {
    id: '4',
    content: 'Amazing work! The animations feel so smooth now.',
    author: teamMembers[1],
    timestamp: '10:32 AM',
    channel: 'general',
    reactions: [{ emoji: '❤️', count: 2 }],
  },
  {
    id: '5',
    content: 'Thanks! Still need to polish the particle effects but the core is solid.',
    author: teamMembers[0],
    timestamp: '10:35 AM',
    channel: 'general',
  },
  {
    id: '6',
    content: 'I finished the forest enemy models. Ready for review!',
    author: teamMembers[2],
    timestamp: '10:45 AM',
    channel: 'general',
    attachment: { type: 'image', name: 'forest_enemies_preview.png' },
  },
  {
    id: '7',
    content: 'Those look incredible! Love the detail on the bark textures.',
    author: teamMembers[3],
    timestamp: '10:48 AM',
    channel: 'general',
  },
  {
    id: '8',
    content: 'Found a critical bug in the matchmaking system. Working on a fix now.',
    author: teamMembers[4],
    timestamp: '11:00 AM',
    channel: 'general',
    reactions: [{ emoji: '👀', count: 2 }],
  },
  {
    id: '9',
    content: 'Let me know if you need any help with the backend logic.',
    author: teamMembers[0],
    timestamp: '11:02 AM',
    channel: 'general',
  },
  {
    id: '10',
    content: 'The new UI mockups are in Figma. Let me know your thoughts!',
    author: teamMembers[3],
    timestamp: '11:15 AM',
    channel: 'general',
    attachment: { type: 'file', name: 'UI_Mockups_v2.fig' },
  },
  {
    id: '11',
    content: 'Battle music drafts uploaded to the shared drive. Would love feedback on the tempo.',
    author: teamMembers[5],
    timestamp: '11:30 AM',
    channel: 'general',
    attachment: { type: 'audio', name: 'battle_theme_draft.mp3' },
  },
  {
    id: '12',
    content: 'Just listened - the crescendo around 1:45 is perfect for the boss phase transition!',
    author: teamMembers[1],
    timestamp: '11:45 AM',
    channel: 'general',
    reactions: [{ emoji: '🎵', count: 3 }],
  },
]

interface Message {
  id: string
  content: string
  author: (typeof teamMembers)[0]
  timestamp: string
  channel: string
  reactions?: { emoji: string; count: number }[]
  attachment?: { type: string; name: string }
}

function ChannelSidebar({
  selectedChannel,
  onSelectChannel,
}: {
  selectedChannel: string
  onSelectChannel: (id: string) => void
}) {
  return (
    <div className="w-64 flex-shrink-0 border-r border-border flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">rVault Studio</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-8 text-sm" />
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-0.5">
            {chatChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                  selectedChannel === channel.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{channel.name}</span>
                {channel.unread > 0 && (
                  <Badge className="h-5 px-1.5 bg-primary text-primary-foreground text-xs">
                    {channel.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-0.5">
            {teamMembers.slice(0, 4).map((member) => (
              <button
                key={member.id}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                    {member.avatar}
                  </div>
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar',
                      member.status === 'online' && 'bg-success',
                      member.status === 'away' && 'bg-warning',
                      member.status === 'offline' && 'bg-muted-foreground'
                    )}
                  />
                </div>
                <span className="flex-1 text-left truncate">{member.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-sm font-medium text-primary-foreground">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar bg-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageItem({ message }: { message: Message }) {
  return (
    <div className="group flex gap-3 px-4 py-2 hover:bg-secondary/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-sm font-medium text-primary-foreground flex-shrink-0">
        {message.author.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{message.author.name}</span>
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5">{message.content}</p>
        
        {message.attachment && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
            {message.attachment.type === 'image' && <Image className="w-4 h-4 text-primary" />}
            {message.attachment.type === 'file' && <File className="w-4 h-4 text-primary" />}
            {message.attachment.type === 'audio' && <Volume2 className="w-4 h-4 text-primary" />}
            <span className="text-sm">{message.attachment.name}</span>
          </div>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, i) => (
              <button
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-sm"
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Smile className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export function ChatContent() {
  const [selectedChannel, setSelectedChannel] = useState('general')
  const [messageInput, setMessageInput] = useState('')

  const currentChannel = chatChannels.find((c) => c.id === selectedChannel) || chatChannels[0]
  const channelMessages = extendedMessages.filter((m) => m.channel === selectedChannel)

  return (
    <div className="flex h-full -m-6">
      <ChannelSidebar
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">{currentChannel.name}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pin className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Users className="w-4 h-4" />
            </Button>
            <div className="relative ml-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search" className="w-48 h-8 pl-8 text-sm" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="py-4">
            {/* Channel intro */}
            <div className="px-4 pb-4 mb-4 border-b border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Hash className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Welcome to #{currentChannel.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                This is the start of the #{currentChannel.name} channel. Use this space to discuss{' '}
                {currentChannel.name === 'general' ? 'anything related to the studio' : currentChannel.name}.
              </p>
            </div>

            {/* Messages list */}
            <div className="space-y-0.5">
              {channelMessages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <Input
              placeholder={`Message #${currentChannel.name}`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <AtSign className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Member sidebar */}
      <div className="w-60 flex-shrink-0 border-l border-border p-4 hidden xl:block">
        <h3 className="font-semibold text-sm mb-3">Members - {teamMembers.length}</h3>
        <div className="space-y-2">
          {/* Online */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Online - {teamMembers.filter((m) => m.status === 'online').length}
            </p>
            {teamMembers
              .filter((m) => m.status === 'online')
              .map((member) => (
                <div key={member.id} className="flex items-center gap-2 py-1">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-xs font-medium text-primary-foreground">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Away */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Away - {teamMembers.filter((m) => m.status === 'away').length}
            </p>
            {teamMembers
              .filter((m) => m.status === 'away')
              .map((member) => (
                <div key={member.id} className="flex items-center gap-2 py-1">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-xs font-medium text-primary-foreground opacity-60">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-muted-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.lastActive}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Offline */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Offline - {teamMembers.filter((m) => m.status === 'offline').length}
            </p>
            {teamMembers
              .filter((m) => m.status === 'offline')
              .map((member) => (
                <div key={member.id} className="flex items-center gap-2 py-1">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-xs font-medium text-primary-foreground opacity-40">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-muted-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.lastActive}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
