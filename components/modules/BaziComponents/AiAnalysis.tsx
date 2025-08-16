'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LightweightMarkdown } from '@/components/ui/lightweight-markdown'

interface AiAnalysisProps {
  aiAnalysis: string
  yongshen?: string
}

export function AiAnalysisCard({ aiAnalysis, yongshen }: AiAnalysisProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-serif text-slate-700 dark:text-slate-300">
          AI智能解析
        </CardTitle>
        {yongshen && (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            用神：<span className="font-medium text-amber-600 dark:text-amber-400">{yongshen}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <LightweightMarkdown content={aiAnalysis} />
        </div>
      </CardContent>
    </Card>
  )
}