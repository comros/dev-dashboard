'use client'

import { type ReactNode, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'

// ─── Syntax tokens ─────────────────────────────────────────────────────────────
// Lightweight tokeniser — no external dep needed. Covers Lua/Luau, TS/JS, Python, shell.

type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'builtin' | 'operator' | 'plain'

interface Token {
  type: TokenType
  value: string
}

const LANG_RULES: Record<
  string,
  { keywords: string[]; builtins?: string[]; lineComment?: string; blockComment?: [string, string] }
> = {
  lua: {
    keywords: [
      'and','break','do','else','elseif','end','false','for','function','goto',
      'if','in','local','nil','not','or','repeat','return','then','true','until','while',
    ],
    builtins: ['print','pairs','ipairs','next','select','type','tostring','tonumber',
      'rawget','rawset','rawequal','rawlen','setmetatable','getmetatable',
      'require','pcall','xpcall','error','assert','coroutine','table','string','math','os','io',
      'game','workspace','script','Instance','Vector3','Vector2','CFrame','Color3','UDim2','UDim',
      'TweenInfo','Enum','task','wait','spawn','delay','warn',
    ],
    lineComment: '--',
    blockComment: ['--[[', ']]'],
  },
  luau: {
    keywords: [
      'and','break','do','else','elseif','end','false','for','function','goto',
      'if','in','local','nil','not','or','repeat','return','then','true','until','while',
      'type','export','continue',
    ],
    builtins: ['print','pairs','ipairs','next','select','type','tostring','tonumber',
      'rawget','rawset','rawequal','rawlen','setmetatable','getmetatable',
      'require','pcall','xpcall','error','assert','coroutine','table','string','math','os',
      'game','workspace','script','Instance','Vector3','Vector2','CFrame','Color3','UDim2','UDim',
      'TweenInfo','Enum','task','wait','warn','buffer',
    ],
    lineComment: '--',
    blockComment: ['--[[', ']]'],
  },
  typescript: {
    keywords: [
      'abstract','any','as','async','await','boolean','break','case','catch','class',
      'const','constructor','continue','debugger','declare','default','delete','do',
      'else','enum','export','extends','false','finally','for','from','function',
      'get','if','implements','import','in','instanceof','interface','keyof',
      'let','module','namespace','never','new','null','number','object','of',
      'override','package','private','protected','public','readonly','return',
      'set','static','string','super','switch','this','throw','true','try','type',
      'typeof','undefined','union','unknown','var','void','while','with','yield',
    ],
    builtins: ['console','Math','Array','Object','Promise','Map','Set','Date','JSON',
      'parseInt','parseFloat','isNaN','isFinite','setTimeout','setInterval','clearTimeout',
      'clearInterval','fetch','URL','Error','Symbol','RegExp','Proxy','Reflect'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  javascript: {
    keywords: [
      'async','await','break','case','catch','class','const','continue','debugger',
      'default','delete','do','else','export','extends','false','finally','for',
      'from','function','if','import','in','instanceof','let','new','null','of',
      'return','static','super','switch','this','throw','true','try','typeof',
      'undefined','var','void','while','with','yield',
    ],
    builtins: ['console','Math','Array','Object','Promise','Map','Set','Date','JSON',
      'parseInt','parseFloat','isNaN','setTimeout','clearTimeout','fetch'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  python: {
    keywords: [
      'False','None','True','and','as','assert','async','await','break','class',
      'continue','def','del','elif','else','except','finally','for','from',
      'global','if','import','in','is','lambda','nonlocal','not','or','pass',
      'raise','return','try','while','with','yield',
    ],
    builtins: ['print','len','range','type','str','int','float','list','dict','set',
      'tuple','bool','open','enumerate','zip','map','filter','sorted','reversed',
      'min','max','sum','abs','round','input','super','isinstance','issubclass'],
    lineComment: '#',
  },
  bash: {
    keywords: ['if','then','else','elif','fi','for','while','do','done','case','esac',
      'function','in','return','exit','local','export','readonly','shift','echo',
      'source','alias','unset'],
    builtins: ['cd','ls','pwd','mkdir','rm','cp','mv','cat','grep','sed','awk',
      'curl','wget','git','npm','yarn','node','python','pip'],
    lineComment: '#',
  },
  json: { keywords: ['true','false','null'], builtins: [] },
  css: {
    keywords: ['important','from','to','and','not','only'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
}

const ALIAS: Record<string, string> = {
  js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash',
  py: 'python', rb: 'ruby', rs: 'rust',
}

function tokenize(code: string, lang: string): Token[] {
  const normalised = ALIAS[lang] ?? lang
  const rules = LANG_RULES[normalised]
  if (!rules) {
    return [{ type: 'plain', value: code }]
  }

  const tokens: Token[] = []
  let i = 0

  const kwSet = new Set(rules.keywords)
  const builtinSet = new Set(rules.builtins ?? [])

  while (i < code.length) {
    // Block comment
    if (rules.blockComment) {
      const [open, close] = rules.blockComment
      if (code.startsWith(open, i)) {
        const end = code.indexOf(close, i + open.length)
        const val = end === -1 ? code.slice(i) : code.slice(i, end + close.length)
        tokens.push({ type: 'comment', value: val })
        i += val.length
        continue
      }
    }
    // Line comment
    if (rules.lineComment && code.startsWith(rules.lineComment, i)) {
      const nl = code.indexOf('\n', i)
      const val = nl === -1 ? code.slice(i) : code.slice(i, nl)
      tokens.push({ type: 'comment', value: val })
      i += val.length
      continue
    }
    // String (double or single quote)
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]
      let j = i + 1
      while (j < code.length && code[j] !== q && code[j] !== '\n') {
        if (code[j] === '\\') j++
        j++
      }
      const val = code.slice(i, j + 1)
      tokens.push({ type: 'string', value: val })
      i = j + 1
      continue
    }
    // Template literal
    if (code[i] === '`') {
      let j = i + 1
      while (j < code.length && code[j] !== '`') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i + 1] ?? ''))) {
      let j = i
      while (j < code.length && /[0-9._xXa-fA-FbBoO]/.test(code[j])) j++
      tokens.push({ type: 'number', value: code.slice(i, j) })
      i = j
      continue
    }
    // Identifier / keyword
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      const type: TokenType = kwSet.has(word) ? 'keyword' : builtinSet.has(word) ? 'builtin' : 'plain'
      tokens.push({ type, value: word })
      i = j
      continue
    }
    // Operator
    if (/[+\-*/%=<>!&|^~?:;,.()\[\]{}]/.test(code[i])) {
      tokens.push({ type: 'operator', value: code[i] })
      i++
      continue
    }
    // Anything else (whitespace, newlines)
    tokens.push({ type: 'plain', value: code[i] })
    i++
  }

  return tokens
}

const TOKEN_CLASSES: Record<TokenType, string> = {
  keyword:  'text-chart-1 font-semibold',
  string:   'text-chart-2',
  comment:  'text-muted-foreground/60 italic',
  number:   'text-chart-4',
  builtin:  'text-chart-3',
  operator: 'text-muted-foreground',
  plain:    '',
}

// ─── Language display names ────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { value: 'luau',       label: 'Luau',       badge: 'LUAU' },
  { value: 'lua',        label: 'Lua',         badge: 'LUA' },
  { value: 'typescript', label: 'TypeScript',  badge: 'TS' },
  { value: 'javascript', label: 'JavaScript',  badge: 'JS' },
  { value: 'python',     label: 'Python',      badge: 'PY' },
  { value: 'bash',       label: 'Bash / Shell',badge: 'SH' },
  { value: 'json',       label: 'JSON',        badge: 'JSON' },
  { value: 'css',        label: 'CSS',         badge: 'CSS' },
  { value: 'text',       label: 'Plain text',  badge: 'TXT' },
]

function getLangBadge(lang: string): string {
  const normalised = ALIAS[lang] ?? lang
  return SUPPORTED_LANGUAGES.find((l) => l.value === normalised)?.badge ?? lang.toUpperCase()
}

// ─── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all',
        copied
          ? 'text-emerald-400 bg-emerald-400/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      )}
      title="Copy code"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({
  lang,
  code,
  defaultLang,
}: {
  lang: string
  code: string
  defaultLang: string
}) {
  const effectiveLang = lang || defaultLang || 'luau'
  const tokens = tokenize(code, effectiveLang)
  const badge = getLangBadge(effectiveLang)

  return (
    <div className="rounded-lg overflow-hidden border border-border/60 my-1 group">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/80 px-3 py-1.5 border-b border-border/60">
        <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground/80 uppercase">
          {badge}
        </span>
        <CopyButton text={code} />
      </div>
      {/* Code */}
      <pre className="bg-[hsl(var(--card))] overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono">
          {tokens.map((tok, i) => (
            tok.type === 'plain'
              ? <span key={i}>{tok.value}</span>
              : <span key={i} className={TOKEN_CLASSES[tok.type]}>{tok.value}</span>
          ))}
        </code>
      </pre>
    </div>
  )
}

// ─── Inline renderer ───────────────────────────────────────────────────────────
function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="bg-muted text-foreground font-mono text-[0.85em] px-1.5 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      )
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
          {linkMatch[1]}
        </a>
      )
    }
    return part
  })
}

// ─── Table parser ──────────────────────────────────────────────────────────────
function parseTableRow(line: string): string[] {
  return line.split('|').map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s\-|:]+\|?$/.test(line) && line.includes('-')
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export interface DocMarkdownProps {
  content: string
  /** Default language for code blocks that don't specify one */
  defaultLang?: string
}

export function DocMarkdown({ content, defaultLang = 'luau' }: DocMarkdownProps) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []

  type ListItem = { text: string; depth: number; ordered: boolean }
  let listItems: ListItem[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return

    const buildList = (items: ListItem[], depth: number): ReactNode => {
      const atDepth = items.filter((it) => it.depth === depth)
      if (atDepth.length === 0) return null
      const allOrdered = atDepth.every((it) => it.ordered)
      const ListTag = allOrdered ? 'ol' : 'ul'

      return (
        <ListTag
          key={key++}
          className={cn(
            'space-y-1 text-muted-foreground',
            depth === 0 ? 'ml-4' : 'ml-6 mt-1',
            allOrdered ? 'list-decimal list-inside' : 'list-disc list-inside'
          )}
        >
          {items.map((item, i) => {
            if (item.depth !== depth) return null
            const childItems = items.slice(i + 1).filter((it) => it.depth === depth + 1)
            const hasChildren = childItems.length > 0 && items[i + 1]?.depth === depth + 1
            return (
              <li key={i} className="leading-relaxed">
                {renderInline(item.text)}
                {hasChildren && buildList(childItems, depth + 1)}
              </li>
            )
          })}
        </ListTag>
      )
    }

    elements.push(buildList(listItems, 0))
    listItems = []
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // ── Fenced code block ──────────────────────────────────────────────────
    const fenceMatch = line.match(/^```(\w*)$/)
    if (fenceMatch) {
      flushList()
      const lang = fenceMatch[1]
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <CodeBlock key={key++} lang={lang} code={codeLines.join('\n')} defaultLang={defaultLang} />
      )
      i++
      continue
    }

    // ── Table ──────────────────────────────────────────────────────────────
    if (line.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushList()
      const headers = parseTableRow(line)
      i += 2 // skip separator
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(parseTableRow(lines[i]))
        i++
      }
      elements.push(
        <div key={key++} className="overflow-x-auto my-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {headers.map((h, hi) => (
                  <th key={hi} className="text-left px-3 py-2 font-semibold text-foreground">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-muted-foreground">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // ── Headings ───────────────────────────────────────────────────────────
    if (line.startsWith('# ')) {
      flushList()
      const text = line.slice(2)
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      elements.push(
        <h1 id={id} key={key++} className="text-2xl font-bold text-foreground mt-2 scroll-mt-4">
          {renderInline(text)}
        </h1>
      )
      i++; continue
    }
    if (line.startsWith('## ')) {
      flushList()
      const text = line.slice(3)
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      elements.push(
        <h2 id={id} key={key++} className="text-xl font-semibold text-foreground mt-8 mb-1 scroll-mt-4">
          {renderInline(text)}
        </h2>
      )
      i++; continue
    }
    if (line.startsWith('### ')) {
      flushList()
      const text = line.slice(4)
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      elements.push(
        <h3 id={id} key={key++} className="text-lg font-medium text-foreground mt-6 mb-1 scroll-mt-4">
          {renderInline(text)}
        </h3>
      )
      i++; continue
    }
    if (line.startsWith('#### ')) {
      flushList()
      const text = line.slice(5)
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      elements.push(
        <h4 id={id} key={key++} className="text-base font-medium text-foreground mt-4 mb-0.5 scroll-mt-4">
          {renderInline(text)}
        </h4>
      )
      i++; continue
    }

    // ── Horizontal rule ────────────────────────────────────────────────────
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      flushList()
      elements.push(<hr key={key++} className="border-border my-4" />)
      i++; continue
    }

    // ── Blockquote ─────────────────────────────────────────────────────────
    if (line.startsWith('> ')) {
      flushList()
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <blockquote key={key++} className="border-l-4 border-primary/40 pl-4 py-0.5 text-muted-foreground italic space-y-1">
          {quoteLines.map((ql, qi) => <p key={qi}>{renderInline(ql)}</p>)}
        </blockquote>
      )
      continue
    }

    // ── Callout / admonition  > [!NOTE] style ─────────────────────────────
    if (line.match(/^>\s*\[!(NOTE|TIP|WARNING|DANGER|INFO)\]/i)) {
      flushList()
      const kind = line.match(/\[!(\w+)\]/i)?.[1]?.toUpperCase() ?? 'NOTE'
      const calloutLines: string[] = []
      i++
      while (i < lines.length && lines[i].startsWith('> ')) {
        calloutLines.push(lines[i].slice(2))
        i++
      }
      const palette: Record<string, string> = {
        NOTE:    'border-blue-500/50 bg-blue-500/5 [&_strong]:text-blue-400',
        TIP:     'border-emerald-500/50 bg-emerald-500/5 [&_strong]:text-emerald-400',
        INFO:    'border-sky-500/50 bg-sky-500/5 [&_strong]:text-sky-400',
        WARNING: 'border-amber-500/50 bg-amber-500/5 [&_strong]:text-amber-400',
        DANGER:  'border-red-500/50 bg-red-500/5 [&_strong]:text-red-400',
      }
      elements.push(
        <div key={key++} className={cn('border-l-4 rounded-r-lg px-4 py-3 space-y-1', palette[kind] ?? palette.NOTE)}>
          <strong className="text-xs font-bold uppercase tracking-widest block mb-1">{kind}</strong>
          {calloutLines.map((cl, ci) => (
            <p key={ci} className="text-sm text-muted-foreground">{renderInline(cl)}</p>
          ))}
        </div>
      )
      continue
    }

    // ── Unordered list ─────────────────────────────────────────────────────
    const unorderedMatch = line.match(/^(\s*)[-*+] (.*)$/)
    if (unorderedMatch) {
      const depth = Math.floor(unorderedMatch[1].length / 2)
      listItems.push({ text: unorderedMatch[2], depth, ordered: false })
      i++; continue
    }

    // ── Ordered list ───────────────────────────────────────────────────────
    const orderedMatch = line.match(/^(\s*)\d+[.)]\s+(.*)$/)
    if (orderedMatch) {
      const depth = Math.floor(orderedMatch[1].length / 2)
      listItems.push({ text: orderedMatch[2], depth, ordered: true })
      i++; continue
    }

    // ── Blank line ─────────────────────────────────────────────────────────
    flushList()
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
      i++; continue
    }

    // ── Paragraph ──────────────────────────────────────────────────────────
    elements.push(
      <p key={key++} className="text-muted-foreground leading-relaxed">
        {renderInline(line)}
      </p>
    )
    i++
  }

  flushList()
  return <div className="space-y-3">{elements}</div>
}

// ─── Heading extractor (for TOC) ──────────────────────────────────────────────
export interface TocEntry {
  level: 1 | 2 | 3 | 4
  text: string
  id: string
}

export function extractToc(content: string): TocEntry[] {
  const toc: TocEntry[] = []
  for (const line of content.split('\n')) {
    const m = line.match(/^(#{1,4}) (.+)$/)
    if (!m) continue
    const level = m[1].length as 1 | 2 | 3 | 4
    const text = m[2]
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    toc.push({ level, text, id })
  }
  return toc
}

// ─── Word count / read time ───────────────────────────────────────────────────
export function getDocStats(content: string): { words: number; readMinutes: number } {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return { words, readMinutes: Math.max(1, Math.round(words / 200)) }
}
