'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

interface BaziPillarProps {
  title: string
  ganzhi: string
  palace: string
  color: string
  isDayPillar?: boolean
}

export function BaziPillar({ 
  title, 
  ganzhi, 
  palace, 
  color, 
  isDayPillar = false 
}: BaziPillarProps) {
  const [tiangan, dizhi] = ganzhi.split('')
  
  return (
    <div className="text-center relative">
      <div className="space-y-3">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</div>
        <div className={`relative p-4 rounded-lg transition-all duration-200 ${
          isDayPillar 
            ? 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shadow-sm' 
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
        }`}>
          {isDayPillar && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="bg-slate-700 text-white border-0 text-xs px-2 py-0.5">
                日主
              </Badge>
            </div>
          )}
          <div className="space-y-2">
            <div className="text-2xl font-serif font-semibold text-slate-700 dark:text-slate-300">
              {tiangan}
            </div>
            <div className="w-6 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            <div className="text-2xl font-serif font-semibold text-slate-700 dark:text-slate-300">
              {dizhi}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {palace}
          </div>
        </div>
      </div>
    </div>
  )
}