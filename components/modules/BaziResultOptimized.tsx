'use client'

import React from 'react'
import { Separator } from '@/components/ui/separator'
import { BaziChartCard } from './BaziComponents/BaziChart'
import { WuXingAnalysisCard } from './BaziComponents/WuXingAnalysis'
import { AiAnalysisCard } from './BaziComponents/AiAnalysis'

interface BaziChart {
  year_ganzhi: string
  month_ganzhi: string
  day_ganzhi: string
  hour_ganzhi: string
}

interface WuXingAnalysis {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
  strongest: string
  weakest: string
  percentages?: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
}

interface BaziResultProps {
  bazi?: BaziChart
  baziChart?: BaziChart
  wuxingAnalysis: WuXingAnalysis
  aiAnalysis: string
  yongshen?: string
  name?: string
  cost?: number
}

export function BaziResultOptimized({ 
  bazi,
  baziChart, 
  wuxingAnalysis, 
  aiAnalysis, 
  yongshen,
  name,
  cost
}: BaziResultProps) {
  // Use either bazi or baziChart prop for backward compatibility
  const chart = bazi || baziChart

  if (!chart) {
    return <div>八字数据缺失</div>
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      {name && (
        <div className="text-center space-y-2">
          <h2 className="text-xl font-serif font-semibold text-slate-800 dark:text-slate-200">
            {name} 的八字命盘分析
          </h2>
          {cost && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              消耗天机点：{cost}
            </div>
          )}
        </div>
      )}

      {/* 八字命盘 */}
      <BaziChartCard baziChart={chart} />

      <Separator className="my-6" />

      {/* 五行分析 */}
      <WuXingAnalysisCard wuxingAnalysis={wuxingAnalysis} />

      <Separator className="my-6" />

      {/* AI分析 */}
      <AiAnalysisCard aiAnalysis={aiAnalysis} yongshen={yongshen} />
    </div>
  )
}

// 默认导出，保持向后兼容
export { BaziResultOptimized as BaziResult }