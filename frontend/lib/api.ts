import type {
  AnalyticsSnapshot,
  DashboardData,
  DocDetail,
  DocFavorite,
  DocRecent,
  DocTreeFolder,
  Experience,
  GithubCommit,
  Profile,
  Task,
  TaskPriority,
  TaskStatus,
  Workspace,
  WorkspaceIntegrations,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

let accessToken: string | null = null
let workspaceId: string | null = null

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!accessToken) {
    throw new Error('Not signed in')
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(workspaceId ? { 'X-Workspace-Id': workspaceId } : {}),
      ...init?.headers,
    },
  })

  if (res.status === 401) {
    throw new Error('Session expired — please sign in again')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  setAccessToken(token: string | null) {
    accessToken = token
  },
  setWorkspaceId(id: string | null) {
    workspaceId = id
  },

  getMe: () =>
    request<{
      profile: Profile | null
      workspaces: Workspace[]
      defaultWorkspaceId: string | null
    }>('/api/me'),

  getDashboard: () => request<DashboardData>('/api/dashboard'),
  getExperiences: () => request<{ experiences: Experience[] }>('/api/experiences'),
  createExperience: (body: {
    name: string
    robloxUniverseId?: string
    robloxPlaceId?: string
    status?: Experience['status']
  }) =>
    request<{ experience: Experience }>('/api/experiences', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAnalytics: (experienceId?: string) =>
    request<{ experiences: Experience[]; snapshots: AnalyticsSnapshot[] }>(
      `/api/analytics${experienceId ? `?experienceId=${experienceId}` : ''}`
    ),
  createSnapshot: (body: {
    experienceId: string
    ccu?: number
    visits?: number
    favorites?: number
    revenueCents?: number
  }) =>
    request('/api/analytics/snapshot', { method: 'POST', body: JSON.stringify(body) }),

  getGithub: () =>
    request<{ configured: boolean; repo: string | null; commits: GithubCommit[] }>(
      '/api/github'
    ),

  getIntegrations: () => request<WorkspaceIntegrations>('/api/workspace/integrations'),
  updateWorkspace: (body: Partial<{
    name: string
    googleDriveAssetsUrl: string | null
    googleDriveDocsFolderId: string | null
    githubRepo: string | null
    discordInviteUrl: string | null
  }>) =>
    request('/api/workspace', { method: 'PATCH', body: JSON.stringify(body) }),

  getTasks: () => request<{ tasks: Task[] }>('/api/tasks'),
  getTaskMembers: () => request<{ members: Profile[] }>('/api/tasks/members'),
  createTask: (body: {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | null
    experienceId?: string | null
    dueDate?: string | null
    tags?: string[]
  }) =>
    request<{ task: Task }>('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (
    id: string,
    body: Partial<{
      title: string
      description: string
      status: TaskStatus
      priority: TaskPriority
      assigneeId: string | null
      experienceId: string | null
      dueDate: string | null
      tags: string[]
    }>
  ) =>
    request<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteTask: (id: string) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),

  getDocsTree: () =>
    request<{
      tree: DocTreeFolder[]
      favorites: DocFavorite[]
      recent: DocRecent[]
    }>('/api/docs/tree'),
  getDoc: (id: string) => request<{ doc: DocDetail }>(`/api/docs/${id}`),
  createDocFolder: (body: { title: string; icon?: string }) =>
    request<{ doc: DocDetail }>('/api/docs/folder', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createDoc: (body: { title: string; parentId: string; content?: string }) =>
    request<{ doc: DocDetail }>('/api/docs', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateDoc: (
    id: string,
    body: Partial<{ title: string; content: string; isFavorite: boolean }>
  ) =>
    request<{ doc: DocDetail }>(`/api/docs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
}
