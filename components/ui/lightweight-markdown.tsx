'use client'

import React, { memo } from 'react'

interface LightweightMarkdownProps {
  content: string
  className?: string
}

// 轻量级Markdown渲染器 - 只处理常用格式，比react-markdown快很多
export const LightweightMarkdown = memo(({ content, className = '' }: LightweightMarkdownProps) => {
  const processMarkdown = (text: string) => {
    // 按行处理
    const lines = text.split('\n')
    const elements: React.ReactElement[] = []
    let listItems: string[] = []
    let listType: 'ul' | 'ol' | null = null
    
    const flushList = () => {
      if (listItems.length > 0) {
        const ListComponent = listType === 'ol' ? 'ol' : 'ul'
        elements.push(
          <ListComponent key={elements.length} className={`mb-4 space-y-2 ${listType === 'ol' ? 'list-decimal' : 'list-disc'} list-inside`}>
            {listItems.map((item, index) => (
              <li key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed pl-2">
                <span className="ml-2 font-serif" dangerouslySetInnerHTML={{__html: processInlineText(item)}} />
              </li>
            ))}
          </ListComponent>
        )
        listItems = []
        listType = null
      }
    }
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // 空行
      if (!trimmed) {
        flushList()
        return
      }
      
      // 标题
      if (trimmed.startsWith('###')) {
        flushList()
        elements.push(
          <h3 key={elements.length} className="text-base font-serif font-medium text-slate-600 dark:text-slate-400 mb-2 mt-4">
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        )
        return
      }
      
      if (trimmed.startsWith('##')) {
        flushList()
        elements.push(
          <h2 key={elements.length} className="text-lg font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 mt-6">
            {trimmed.replace(/^##\s*/, '')}
          </h2>
        )
        return
      }
      
      if (trimmed.startsWith('#')) {
        flushList()
        elements.push(
          <h1 key={elements.length} className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
            {trimmed.replace(/^#\s*/, '')}
          </h1>
        )
        return
      }
      
      // 无序列表
      if (trimmed.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList()
          listType = 'ul'
        }
        listItems.push(trimmed.replace(/^-\s*/, ''))
        return
      }
      
      // 有序列表
      if (/^\d+\.\s/.test(trimmed)) {
        if (listType !== 'ol') {
          flushList()
          listType = 'ol'
        }
        listItems.push(trimmed.replace(/^\d+\.\s*/, ''))
        return
      }
      
      // 普通段落
      flushList()
      if (trimmed) {
        elements.push(
          <p key={elements.length} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 font-serif" 
             dangerouslySetInnerHTML={{__html: processInlineText(trimmed)}} 
          />
        )
      }
    })
    
    flushList()
    return elements
  }
  
  const processInlineText = (text: string) => {
    return text
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-amber-700 dark:text-amber-300">$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600 dark:text-slate-400">$1</em>')
      // 内联代码
      .replace(/`(.*?)`/g, '<code class="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
  }
  
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      {processMarkdown(content)}
    </div>
  )
})

LightweightMarkdown.displayName = 'LightweightMarkdown'