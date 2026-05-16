import type { DocNode, Experience, Profile, Task } from '../types.js'

export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    displayName: row.display_name as string,
    avatarInitials: row.avatar_initials as string,
    robloxUsername: (row.roblox_username as string | null) ?? undefined,
  }
}

export function mapExperience(row: Record<string, unknown>): Experience {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    name: row.name as string,
    robloxUniverseId: (row.roblox_universe_id as string | null) ?? undefined,
    robloxPlaceId: (row.roblox_place_id as string | null) ?? undefined,
    iconUrl: (row.icon_url as string | null) ?? undefined,
    status: row.status as Experience['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapTask(row: Record<string, unknown>): Task {
  const assignee = row.assignee as Record<string, unknown> | null | undefined
  const experience = row.experience as Record<string, unknown> | null | undefined
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    assignee: assignee ? mapProfile(assignee) : null,
    experienceId: (row.experience_id as string | null) ?? undefined,
    experience: experience
      ? { id: experience.id as string, name: experience.name as string }
      : undefined,
    dueDate: (row.due_date as string | null) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    position: (row.position as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapDocNode(row: Record<string, unknown>): DocNode {
  const editor = row.last_edited_by_member as Record<string, unknown> | null | undefined
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    parentId: (row.parent_id as string | null) ?? null,
    title: row.title as string,
    isFolder: row.is_folder as boolean,
    content: (row.content as string) ?? '',
    icon: (row.icon as string | null) ?? null,
    isFavorite: row.is_favorite as boolean,
    sortOrder: (row.sort_order as number) ?? 0,
    googleDriveFileId: (row.google_drive_file_id as string | null) ?? undefined,
    lastEditedBy: editor ? mapProfile(editor) : null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
