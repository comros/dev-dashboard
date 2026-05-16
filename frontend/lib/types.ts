export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ExperienceStatus = 'live' | 'development' | 'maintenance' | 'archived'

export interface Profile {
  id: string
  displayName: string
  avatarInitials: string
  robloxUsername?: string | null
}

export interface Workspace {
  id: string
  name: string
  slug: string
  role?: string
  googleDriveAssetsUrl?: string | null
  googleDriveDocsFolderId?: string | null
  githubRepo?: string | null
  discordInviteUrl?: string | null
}

export interface Experience {
  id: string
  name: string
  robloxUniverseId?: string
  robloxPlaceId?: string
  iconUrl?: string
  status: ExperienceStatus
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: Profile | null
  experienceId?: string
  experience?: { id: string; name: string }
  dueDate?: string | null
  tags: string[]
  position: number
  createdAt: string
  updatedAt: string
}

export interface DocTreeFolder {
  id: string
  title: string
  icon: string | null
  sortOrder: number
  children: DocTreePage[]
}

export interface DocTreePage {
  id: string
  title: string
  isFavorite: boolean
  sortOrder: number
  lastEditedAt: string
  editedBy?: Profile | null
  googleDriveFileId?: string
}

export interface DocDetail {
  id: string
  parentId: string | null
  title: string
  content: string
  isFavorite: boolean
  lastEditedBy?: Profile | null
  updatedAt: string
  googleDriveFileId?: string
}

export interface DocFavorite {
  id: string
  title: string
  folderId: string | null
}

export interface DocRecent {
  id: string
  title: string
  folder: string
  editedBy?: Profile | null
  editedAt: string
}

export interface DashboardData {
  stats: {
    totalCcu: number
    totalVisits: number
    totalRevenueCents: number
    activeTasks: number
    experienceCount: number
  }
  experiences: Experience[]
  recentTasks: Task[]
  recentCommits: GithubCommit[]
  chartData: {
    ccuHistory: { date: string; value: number }[]
    revenueHistory: { date: string; value: number }[]
  }
}

export interface GithubCommit {
  id: string
  sha: string
  message: string
  authorName: string
  authorAvatar?: string | null
  branch: string
  committedAt: string
  additions: number
  deletions: number
  htmlUrl?: string | null
}

export interface AnalyticsSnapshot {
  id: string
  experienceId: string
  ccu: number
  visits: number
  favorites: number
  revenueCents: number
  recordedAt: string
}

export interface WorkspaceIntegrations {
  googleDriveAssetsUrl: string | null
  googleDriveDocsFolderId: string | null
  googleDriveAssetsEmbed: string | null
  googleDriveDocsOpenUrl: string | null
  githubRepo: string | null
  discordInviteUrl: string | null
  githubTokenConfigured: boolean
}
