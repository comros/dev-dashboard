// Mock data for rVault game development platform

export interface Game {
  id: string
  name: string
  thumbnail: string
  status: 'live' | 'development' | 'maintenance'
  ccu: number
  ccuChange: number
  dau: number
  revenue: number
  revenueChange: number
  visits: number
  rating: number
  lastUpdated: string
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'away' | 'offline'
  lastActive?: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: TeamMember
  dueDate?: string
  tags: string[]
  gameId?: string
}

export interface Commit {
  id: string
  message: string
  author: TeamMember
  timestamp: string
  branch: string
  additions: number
  deletions: number
  status: 'success' | 'pending' | 'failed'
}

export interface ChatMessage {
  id: string
  content: string
  author: TeamMember
  timestamp: string
  channel: string
  reactions?: { emoji: string; count: number }[]
}

export interface Asset {
  id: string
  name: string
  type: 'model' | 'audio' | 'texture' | 'script' | 'ui'
  thumbnail?: string
  size: string
  uploadedBy: TeamMember
  uploadedAt: string
  tags: string[]
}

export interface DocPage {
  id: string
  title: string
  content: string
  lastEditedBy: TeamMember
  lastEditedAt: string
  parentId?: string
}

// Team members
export const teamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', avatar: 'JD', role: 'Lead Developer', status: 'online' },
  { id: '2', name: 'Sarah Chen', avatar: 'SC', role: 'Game Designer', status: 'online' },
  { id: '3', name: 'Mike Ross', avatar: 'MR', role: '3D Artist', status: 'away', lastActive: '15m ago' },
  { id: '4', name: 'Emma Wilson', avatar: 'EW', role: 'UI/UX Designer', status: 'online' },
  { id: '5', name: 'Alex Turner', avatar: 'AT', role: 'Backend Engineer', status: 'offline', lastActive: '2h ago' },
  { id: '6', name: 'Lisa Park', avatar: 'LP', role: 'Sound Designer', status: 'online' },
]

// Games
export const games: Game[] = [
  {
    id: '1',
    name: 'Dragon Realm',
    thumbnail: '/games/dragon-realm.jpg',
    status: 'live',
    ccu: 45230,
    ccuChange: 12.5,
    dau: 892000,
    revenue: 125400,
    revenueChange: 8.3,
    visits: 15200000,
    rating: 4.8,
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    name: 'Tower Defense Pro',
    thumbnail: '/games/tower-defense.jpg',
    status: 'live',
    ccu: 23100,
    ccuChange: -3.2,
    dau: 456000,
    revenue: 67800,
    revenueChange: 5.1,
    visits: 8400000,
    rating: 4.6,
    lastUpdated: '5 hours ago',
  },
  {
    id: '3',
    name: 'Space Explorers',
    thumbnail: '/games/space-explorers.jpg',
    status: 'development',
    ccu: 0,
    ccuChange: 0,
    dau: 0,
    revenue: 0,
    revenueChange: 0,
    visits: 0,
    rating: 0,
    lastUpdated: '1 hour ago',
  },
  {
    id: '4',
    name: 'Racing Thunder',
    thumbnail: '/games/racing-thunder.jpg',
    status: 'maintenance',
    ccu: 0,
    ccuChange: -100,
    dau: 234000,
    revenue: 34500,
    revenueChange: -12.4,
    visits: 5600000,
    rating: 4.4,
    lastUpdated: '30 minutes ago',
  },
]

// Tasks
export const tasks: Task[] = [
  {
    id: '1',
    title: 'Implement new combat system',
    description: 'Design and implement the revamped combat mechanics for Dragon Realm',
    status: 'in-progress',
    priority: 'high',
    assignee: teamMembers[0],
    dueDate: '2024-02-15',
    tags: ['gameplay', 'dragon-realm'],
    gameId: '1',
  },
  {
    id: '2',
    title: 'Create new enemy models',
    description: 'Design 5 new enemy character models for the forest biome',
    status: 'in-progress',
    priority: 'medium',
    assignee: teamMembers[2],
    dueDate: '2024-02-18',
    tags: ['art', '3d', 'dragon-realm'],
    gameId: '1',
  },
  {
    id: '3',
    title: 'Fix matchmaking bug',
    description: 'Players occasionally get stuck in matchmaking queue',
    status: 'todo',
    priority: 'urgent',
    assignee: teamMembers[4],
    dueDate: '2024-02-10',
    tags: ['bug', 'tower-defense'],
    gameId: '2',
  },
  {
    id: '4',
    title: 'Design new UI kit',
    description: 'Create a cohesive UI kit for Space Explorers',
    status: 'review',
    priority: 'medium',
    assignee: teamMembers[3],
    dueDate: '2024-02-20',
    tags: ['ui', 'design', 'space-explorers'],
    gameId: '3',
  },
  {
    id: '5',
    title: 'Compose battle music',
    description: 'Create 3 new battle music tracks for boss fights',
    status: 'backlog',
    priority: 'low',
    assignee: teamMembers[5],
    tags: ['audio', 'dragon-realm'],
    gameId: '1',
  },
  {
    id: '6',
    title: 'Optimize server performance',
    description: 'Reduce server response time by 30%',
    status: 'done',
    priority: 'high',
    assignee: teamMembers[4],
    tags: ['backend', 'optimization'],
  },
  {
    id: '7',
    title: 'Add achievement system',
    description: 'Implement player achievements and badges',
    status: 'todo',
    priority: 'medium',
    assignee: teamMembers[0],
    dueDate: '2024-02-25',
    tags: ['feature', 'dragon-realm'],
    gameId: '1',
  },
  {
    id: '8',
    title: 'Vehicle physics overhaul',
    description: 'Improve vehicle handling and physics simulation',
    status: 'in-progress',
    priority: 'high',
    assignee: teamMembers[0],
    dueDate: '2024-02-12',
    tags: ['gameplay', 'racing-thunder'],
    gameId: '4',
  },
]

// Commits
export const commits: Commit[] = [
  {
    id: '1',
    message: 'feat: implement new combat animations',
    author: teamMembers[0],
    timestamp: '10 minutes ago',
    branch: 'feature/combat-system',
    additions: 234,
    deletions: 45,
    status: 'success',
  },
  {
    id: '2',
    message: 'fix: resolve matchmaking timeout issue',
    author: teamMembers[4],
    timestamp: '1 hour ago',
    branch: 'hotfix/matchmaking',
    additions: 12,
    deletions: 8,
    status: 'success',
  },
  {
    id: '3',
    message: 'chore: update dependencies',
    author: teamMembers[0],
    timestamp: '2 hours ago',
    branch: 'main',
    additions: 156,
    deletions: 89,
    status: 'pending',
  },
  {
    id: '4',
    message: 'feat: add new enemy AI behaviors',
    author: teamMembers[0],
    timestamp: '3 hours ago',
    branch: 'feature/enemy-ai',
    additions: 567,
    deletions: 123,
    status: 'success',
  },
  {
    id: '5',
    message: 'style: update UI components',
    author: teamMembers[3],
    timestamp: '5 hours ago',
    branch: 'feature/ui-refresh',
    additions: 89,
    deletions: 34,
    status: 'failed',
  },
]

// Chat messages
export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hey team, the new combat system is looking great! Check out the latest build.',
    author: teamMembers[0],
    timestamp: '10:30 AM',
    channel: 'general',
    reactions: [{ emoji: '🔥', count: 3 }, { emoji: '👍', count: 5 }],
  },
  {
    id: '2',
    content: 'I finished the forest enemy models. Ready for review!',
    author: teamMembers[2],
    timestamp: '10:45 AM',
    channel: 'art',
  },
  {
    id: '3',
    content: 'Found a critical bug in the matchmaking system. Working on a fix now.',
    author: teamMembers[4],
    timestamp: '11:00 AM',
    channel: 'dev',
    reactions: [{ emoji: '👀', count: 2 }],
  },
  {
    id: '4',
    content: 'The new UI mockups are in Figma. Let me know your thoughts!',
    author: teamMembers[3],
    timestamp: '11:15 AM',
    channel: 'design',
  },
  {
    id: '5',
    content: 'Battle music drafts uploaded to the shared drive.',
    author: teamMembers[5],
    timestamp: '11:30 AM',
    channel: 'audio',
  },
]

// CCU history data for charts
export const ccuHistory = [
  { time: '00:00', dragonRealm: 32000, towerDefense: 18000 },
  { time: '02:00', dragonRealm: 28000, towerDefense: 15000 },
  { time: '04:00', dragonRealm: 22000, towerDefense: 12000 },
  { time: '06:00', dragonRealm: 25000, towerDefense: 14000 },
  { time: '08:00', dragonRealm: 35000, towerDefense: 19000 },
  { time: '10:00', dragonRealm: 42000, towerDefense: 22000 },
  { time: '12:00', dragonRealm: 48000, towerDefense: 25000 },
  { time: '14:00', dragonRealm: 52000, towerDefense: 28000 },
  { time: '16:00', dragonRealm: 55000, towerDefense: 30000 },
  { time: '18:00', dragonRealm: 58000, towerDefense: 32000 },
  { time: '20:00', dragonRealm: 52000, towerDefense: 28000 },
  { time: '22:00', dragonRealm: 45230, towerDefense: 23100 },
]

// Revenue history
export const revenueHistory = [
  { date: 'Jan 1', revenue: 98000 },
  { date: 'Jan 8', revenue: 105000 },
  { date: 'Jan 15', revenue: 112000 },
  { date: 'Jan 22', revenue: 108000 },
  { date: 'Jan 29', revenue: 118000 },
  { date: 'Feb 5', revenue: 125400 },
]

// DAU history
export const dauHistory = [
  { date: 'Mon', dau: 780000 },
  { date: 'Tue', dau: 820000 },
  { date: 'Wed', dau: 850000 },
  { date: 'Thu', dau: 830000 },
  { date: 'Fri', dau: 890000 },
  { date: 'Sat', dau: 920000 },
  { date: 'Sun', dau: 892000 },
]

// Chat channels
export const chatChannels = [
  { id: 'general', name: 'General', unread: 3 },
  { id: 'dev', name: 'Development', unread: 1 },
  { id: 'art', name: 'Art & Design', unread: 0 },
  { id: 'audio', name: 'Audio', unread: 2 },
  { id: 'announcements', name: 'Announcements', unread: 0 },
]

// Assets
export const assets: Asset[] = [
  {
    id: '1',
    name: 'Dragon_Boss_Model.rbxm',
    type: 'model',
    size: '2.4 MB',
    uploadedBy: teamMembers[2],
    uploadedAt: '2 hours ago',
    tags: ['dragon-realm', 'boss', 'character'],
  },
  {
    id: '2',
    name: 'Battle_Theme_01.ogg',
    type: 'audio',
    size: '4.1 MB',
    uploadedBy: teamMembers[5],
    uploadedAt: '5 hours ago',
    tags: ['music', 'battle', 'dragon-realm'],
  },
  {
    id: '3',
    name: 'Forest_Ground_Texture.png',
    type: 'texture',
    size: '1.2 MB',
    uploadedBy: teamMembers[2],
    uploadedAt: '1 day ago',
    tags: ['environment', 'forest', 'texture'],
  },
  {
    id: '4',
    name: 'PlayerController.lua',
    type: 'script',
    size: '24 KB',
    uploadedBy: teamMembers[0],
    uploadedAt: '3 hours ago',
    tags: ['gameplay', 'player', 'controller'],
  },
  {
    id: '5',
    name: 'MainMenu_Layout.rbxm',
    type: 'ui',
    size: '156 KB',
    uploadedBy: teamMembers[3],
    uploadedAt: '6 hours ago',
    tags: ['ui', 'menu', 'layout'],
  },
]

// Documentation pages
export const docPages: DocPage[] = [
  {
    id: '1',
    title: 'Getting Started',
    content: 'Welcome to the rVault documentation...',
    lastEditedBy: teamMembers[0],
    lastEditedAt: '1 day ago',
  },
  {
    id: '2',
    title: 'Combat System',
    content: 'The combat system in Dragon Realm...',
    lastEditedBy: teamMembers[0],
    lastEditedAt: '2 hours ago',
    parentId: '1',
  },
  {
    id: '3',
    title: 'Art Style Guide',
    content: 'Our games follow a cohesive art style...',
    lastEditedBy: teamMembers[2],
    lastEditedAt: '3 days ago',
  },
  {
    id: '4',
    title: 'Audio Guidelines',
    content: 'Audio implementation standards...',
    lastEditedBy: teamMembers[5],
    lastEditedAt: '1 week ago',
  },
]

// Notifications
export const notifications = [
  { id: '1', type: 'commit', message: 'New commit pushed to feature/combat-system', time: '10m ago' },
  { id: '2', type: 'task', message: 'You were assigned to "Fix matchmaking bug"', time: '1h ago' },
  { id: '3', type: 'mention', message: 'Sarah Chen mentioned you in #design', time: '2h ago' },
  { id: '4', type: 'alert', message: 'Dragon Realm CCU reached 50k!', time: '3h ago' },
]
