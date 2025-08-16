'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WuXingChart } from './WuXingChart'

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

interface WuXingAnalysisProps {
  wuxingAnalysis: WuXingAnalysis
}

export function WuXingAnalysisCard({ wuxingAnalysis }: WuXingAnalysisProps) {
  function calculateBalanceScore(wuxingAnalysis: WuXingAnalysis): number {
    const values = Object.values(wuxingAnalysis).slice(0, 5) as number[]
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
    const maxVariance = Math.pow(8, 2) // 最大可能方差（全部集中在一个元素）
    const balanceScore = Math.max(0, 100 - (variance / maxVariance * 100))
    return Math.round(balanceScore)
  }

  const balanceScore = calculateBalanceScore(wuxingAnalysis)
  
  const elements = [
    { name: '木', key: 'wood', value: wuxingAnalysis.wood, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { name: '火', key: 'fire', value: wuxingAnalysis.fire, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    { name: '土', key: 'earth', value: wuxingAnalysis.earth, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { name: '金', key: 'metal', value: wuxingAnalysis.metal, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-900/20' },
    { name: '水', key: 'water', value: wuxingAnalysis.water, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' }
  ]

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-serif text-slate-700 dark:text-slate-300">
          五行分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 五行圆形图表 */}
        {wuxingAnalysis.percentages && (
          <div className="flex justify-center">
            <WuXingChart percentages={wuxingAnalysis.percentages} />
          </div>
        )}

        {/* 五行数值 */}
        <div className="grid grid-cols-5 gap-2">
          {elements.map((element) => (
            <div key={element.key} className={`text-center p-3 rounded-lg ${element.bgColor}`}>
              <div className={`text-lg font-serif font-semibold ${element.color}`}>
                {element.name}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                {element.value}
              </div>
            </div>
          ))}
        </div>

        {/* 五行特征 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">最强五行</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
              {wuxingAnalysis.strongest}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">最弱五行</span>
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20">
              {wuxingAnalysis.weakest}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">平衡指数</span>
            <Badge variant="outline" className={`${
              balanceScore >= 80 ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20' :
              balanceScore >= 60 ? 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
              'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20'
            }`}>
              {balanceScore}分
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}