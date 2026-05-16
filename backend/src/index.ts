import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { requireAuth } from './middleware/auth.js'
import { analyticsRouter } from './routes/analytics.js'
import { dashboardRouter } from './routes/dashboard.js'
import { docsRouter } from './routes/docs.js'
import { experiencesRouter } from './routes/experiences.js'
import { githubRouter } from './routes/github.js'
import { meRouter } from './routes/me.js'
import { tasksRouter } from './routes/tasks.js'
import { workspaceRouter } from './routes/workspace.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000'

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/me', requireAuth, meRouter)
app.use('/api/workspace', requireAuth, workspaceRouter)
app.use('/api/experiences', requireAuth, experiencesRouter)
app.use('/api/dashboard', requireAuth, dashboardRouter)
app.use('/api/analytics', requireAuth, analyticsRouter)
app.use('/api/github', requireAuth, githubRouter)
app.use('/api/tasks', requireAuth, tasksRouter)
app.use('/api/docs', requireAuth, docsRouter)

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
)

app.listen(port, () => {
  console.log(`[backend] API listening on http://localhost:${port}`)
})
