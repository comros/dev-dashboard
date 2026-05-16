import type { NextFunction, Request, Response } from 'express'
import { createUserClient } from '../lib/supabase.js'
import type { User } from '@supabase/supabase-js'

export interface AuthedRequest extends Request {
  user?: User
  accessToken?: string
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization token' })
    return
  }

  const token = header.slice(7)
  const supabase = createUserClient(token)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired session' })
    return
  }

  req.user = data.user
  req.accessToken = token
  next()
}

export function getWorkspaceId(req: Request): string | null {
  const id = req.headers['x-workspace-id']
  return typeof id === 'string' && id.length > 0 ? id : null
}
