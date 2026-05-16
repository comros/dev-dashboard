'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-foreground font-medium">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export function DocMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let listItems: string[] = []
  let listOrdered = false
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return
    const ListTag = listOrdered ? 'ol' : 'ul'
    elements.push(
      <ListTag
        key={key++}
        className={cn(
          'space-y-2 text-muted-foreground ml-4',
          listOrdered ? 'list-decimal list-inside' : 'list-disc list-inside'
        )}
      >
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ListTag>
    )
    listItems = []
    listOrdered = false
  }

  for (const line of lines) {
    if (line.startsWith('# ')) {
      flushList()
      elements.push(
        <h1 key={key++} className="text-2xl font-bold">
          {line.slice(2)}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={key++} className="text-xl font-semibold mt-8">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={key++} className="text-lg font-medium mt-6">
          {line.slice(4)}
        </h3>
      )
      continue
    }
    if (line.match(/^[-*] /)) {
      listOrdered = false
      listItems.push(line.replace(/^[-*] /, ''))
      continue
    }
    if (line.match(/^\d+\. /)) {
      listOrdered = true
      listItems.push(line.replace(/^\d+\. /, ''))
      continue
    }
    flushList()
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }
    elements.push(
      <p key={key++} className="text-muted-foreground leading-relaxed">
        {renderInline(line)}
      </p>
    )
  }
  flushList()

  return <div className="space-y-4">{elements}</div>
}
