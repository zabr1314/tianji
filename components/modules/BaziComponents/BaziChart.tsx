'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BaziPillar } from './BaziPillar'

interface BaziChart {
  year_ganzhi: string
  month_ganzhi: string
  day_ganzhi: string
  hour_ganzhi: string
}

interface BaziChartProps {
  baziChart: BaziChart
}

export function BaziChartCard({ baziChart }: BaziChartProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-serif text-slate-700 dark:text-slate-300">
          八字命盘
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <BaziPillar
            title="年柱"
            ganzhi={baziChart.year_ganzhi}
            palace="年宫"
            color="text-blue-600"
          />
          <BaziPillar
            title="月柱"
            ganzhi={baziChart.month_ganzhi}
            palace="月宫"
            color="text-green-600"
          />
          <BaziPillar
            title="日柱"
            ganzhi={baziChart.day_ganzhi}
            palace="日宫"
            color="text-red-600"
            isDayPillar={true}
          />
          <BaziPillar
            title="时柱"
            ganzhi={baziChart.hour_ganzhi}
            palace="时宫"
            color="text-purple-600"
          />
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            年柱代表祖上、月柱代表父母、日柱代表自己（日主）、时柱代表子女
          </div>
        </div>
      </CardContent>
    </Card>
  )
}