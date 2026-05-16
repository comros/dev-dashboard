/**
 * Starts frontend + backend with only two Node processes (no nested npm/concurrently).
 * Lower memory use than: concurrently -> npm --prefix -> next/tsx
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const frontendDir = path.join(root, 'frontend')
const backendDir = path.join(root, 'backend')

const nextCli = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next')
const tsxCli = path.join(backendDir, 'node_modules', 'tsx', 'dist', 'cli.mjs')

function start(name, cwd, args) {
  const child = spawn(process.execPath, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
      // Cap each dev server; raise if builds OOM (value is MB)
      NODE_OPTIONS: mergeNodeOptions(process.env.NODE_OPTIONS, '--max-old-space-size=4096'),
    },
  })
  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] stopped (${signal})`)
    } else if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`)
      shutdown(code)
    }
  })
  return child
}

function mergeNodeOptions(existing, extra) {
  if (!existing) return extra
  if (existing.includes('max-old-space-size')) return existing
  return `${existing} ${extra}`
}

const children = [
  start('frontend', frontendDir, [nextCli, 'dev']),
  start('backend', backendDir, [
    tsxCli,
    'watch',
    '--ignore',
    'node_modules',
    '--ignore',
    'dist',
    'src/index.ts',
  ]),
]

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
