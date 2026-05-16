export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ExperienceStatus = 'live' | 'development' | 'maintenance' | 'archived'

export interface Profile {
  id: string
  displayName: string
  avatarInitials: string
  robloxUsername?: string
}

export interface Experience {
  id: string
  workspaceId: string
  name: string
  robloxUniverseId?: string
  robloxPlaceId?: string
  iconUrl?: string
  status: ExperienceStatus
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  workspaceId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: Profile | null
  experienceId?: string
  experience?: { id: string; name: string }
  dueDate?: string
  tags: string[]
  position: number
  createdAt: string
  updatedAt: string
}

export interface DocNode {
  id: string
  workspaceId: string
  parentId: string | null
  title: string
  isFolder: boolean
  content: string
  icon: string | null
  isFavorite: boolean
  sortOrder: number
  googleDriveFileId?: string
  lastEditedBy?: Profile | null
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
