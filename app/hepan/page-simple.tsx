'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HepanResult {
  success: boolean
  compatibility: {
    overall_score: number
  }
  detailed_scores: {
    love_score: number
    career_score: number
    wealth_score: number
    health_score: number
    family_score: number
  }
  ai_analysis: string
}

export default function HepanPageSimple() {
  const [result, setResult] = useState<HepanResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查URL参数，如果有recordId则加载历史记录
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const recordId = urlParams.get('recordId')
    
    if (recordId) {
      loadHistoryRecord(recordId)
    }
  }, [])

  const loadHistoryRecord = async (recordId: string) => {
    try {
      setIsAnalyzing(true)
      const response = await fetch(`/api/history/records/${recordId}`)
      const data = await response.json()

      if (data.success && data.data) {
        const record = data.data
        if (record.analysis_type === 'hepan' && record.output_data) {
          setResult(record.output_data as HepanResult)
        }
      } else {
        setError('加载历史记录失败')
        console.error('Failed to load history record:', data.error)
      }
    } catch (error) {
      console.error('Error loading history record:', error)
      setError('加载历史记录时发生错误')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">合盘分析结果</h1>

        {isAnalyzing && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>正在加载分析结果...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="py-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => setError(null)}>重试</Button>
            </CardContent>
          </Card>
        )}

        {result && result.compatibility && result.detailed_scores && (
          <div className="space-y-6">
            {/* 综合评分 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">综合匹配度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-amber-600 mb-2">
                    {result.compatibility.overall_score}
                  </div>
                  <div className="text-lg text-slate-600">分</div>
                </div>
              </CardContent>
            </Card>

            {/* 详细评分 */}
            <div className="grid grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">感情和谐</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center text-amber-600">
                    {result.detailed_scores.love_score}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">事业配合</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center text-amber-600">
                    {result.detailed_scores.career_score}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">财运互补</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center text-amber-600">
                    {result.detailed_scores.wealth_score}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">健康相助</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center text-amber-600">
                    {result.detailed_scores.health_score}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">家庭和睦</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center text-amber-600">
                    {result.detailed_scores.family_score}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI分析 */}
            <Card>
              <CardHeader>
                <CardTitle>AI智能分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-slate-700">
                  {result.ai_analysis || '暂无AI分析结果'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && !isAnalyzing && !error && (
          <Card>
            <CardContent className="py-8 text-center">
              <p>没有找到分析结果</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}