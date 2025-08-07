'use client'

import { useState } from 'react'
import { BaziCalculator } from '@/lib/bazi/calculator'
import { TianjiPointsCalculator } from '@/lib/tianji-points/calculator'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)

  const testBaziCalculation = () => {
    try {
      // 测试真太阳时计算
      const testDate = new Date('1990-06-15T14:30:00')
      const solarTime = BaziCalculator.calculateSolarTime(testDate, 116.4074)
      
      // 测试八字生成
      const bazi = BaziCalculator.generateBazi(solarTime)
      
      // 测试五行分析
      const wuxing = BaziCalculator.analyzeWuXing(bazi)
      
      // 测试大运计算
      const dayun = BaziCalculator.calculateDayun(bazi, new Date('1990-06-15'), 'male')
      
      // 测试用神判断
      const yongshen = BaziCalculator.determinYongshen(wuxing, bazi.day_ganzhi[0])
      
      // 测试天机点计算
      const points = TianjiPointsCalculator.calculatePoints(68)
      const serviceCost = TianjiPointsCalculator.getServiceCost('bazi_analysis')
      
      setResult({
        solarTime: solarTime.toISOString(),
        bazi,
        wuxing,
        dayun: dayun.slice(0, 3), // 只显示前3步大运
        yongshen,
        tianjiPoints: {
          for68RMB: points,
          baziCost: serviceCost
        }
      })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error occurred' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">天机AI - 系统测试页面</h1>
      
      <div className="mb-8">
        <button
          onClick={testBaziCalculation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          测试八字计算功能
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">测试结果</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-bold mb-2">测试说明：</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>测试数据：1990年6月15日14:30，北京</li>
          <li>验证真太阳时计算</li>
          <li>验证八字排盘算法</li>
          <li>验证五行分析</li>
          <li>验证大运计算</li>
          <li>验证用神判断</li>
          <li>验证天机点系统</li>
        </ul>
      </div>
    </div>
  )
}