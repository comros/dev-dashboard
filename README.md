# dev-dashboard

Roblox studio hub: auth, tasks, markdown docs, analytics, GitHub, and Google Drive assets — **Next.js frontend** + **Express API** + **Supabase**.

## Layout

```
frontend/     Next.js UI (port 3000)
backend/      Express API (port 3001)
backend/supabase/migrations/
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers**: enable Email.
3. **SQL Editor** — run in order:
   - `backend/supabase/migrations/001_tasks_and_docs.sql` (skip if already applied)
   - `backend/supabase/migrations/002_auth_workspace_roblox.sql`
4. **Project Settings → API** copy:
   - URL → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

Signup creates a profile, default workspace, sample doc folders, and one experience.

## Environment

**`backend/.env`**

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
GITHUB_TOKEN=          # optional, for GitHub sync
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Run

```powershell
npm run setup
# Terminal 1
npm run dev:backend
# Terminal 2
npm run dev:frontend
```

Open http://localhost:3000 → sign up / sign in.

## Features

| Area | Behavior |
|------|----------|
| **Auth** | Email login; `/login` when signed out; dashboard when signed in |
| **Tasks** | Kanban, create/update (requires sign-in + workspace) |
| **Docs** | Markdown in DB; **+** new doc/folder; edit & save |
| **Assets** | Google Drive folder link + embed (Settings) |
| **Analytics** | Record CCU/visits/revenue snapshots per experience |
| **GitHub** | Commits from `owner/repo` + `GITHUB_TOKEN` |
| **Settings** | Drive URLs, GitHub repo, Discord invite, experiences |

Removed from nav: Team Chat, AI Tools, Moodboard (use Discord for chat).

## Google Drive

- **Assets**: paste a shared folder URL in Settings → opens/embeds in Assets.
- **Docs**: stored as markdown in Supabase; optional Drive folder ID in Settings for your team workflow (full Drive API sync can be added later).

## Why tasks failed before

The API now requires a **Bearer token** from Supabase Auth. Sign up, sign in, then create tasks. Run migration `002` so rows are scoped to your workspace.
