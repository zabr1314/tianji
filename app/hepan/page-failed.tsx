'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Calendar } from 'lucide-react'
import Link from 'next/link'
import { CircularProgress } from '@/components/ui/circular-progress'
import { RadarChart } from '@/components/ui/radar-chart'
import { AnimatedProgress } from '@/components/ui/animated-progress'

interface HepanResult {
  id: string
  user_id: string
  person1_name: string
  person2_name: string
  compatibility_result?: {
    person1?: any
    person2?: any
    compatibility?: {
      overall_score?: number
    }
    detailed_scores?: {
      love_score?: number
      career_score?: number
      wealth_score?: number
      health_score?: number
      family_score?: number
    }
    analysis?: {
      strengths?: string[]
      challenges?: string[]
      suggestions?: string[]
    }
  }
  ai_analysis?: string
}

export default function HepanPageStep1() {
  const [result, setResult] = useState<HepanResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查URL参数，如果有recordId则加载历史记录
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const recordId = urlParams.get('recordId')
    console.log('URL recordId:', recordId)
    
    if (recordId) {
      loadHistoryRecord(recordId)
    }
  }, [])

  const loadHistoryRecord = async (recordId: string) => {
    try {
      console.log('Loading history record:', recordId)
      setIsAnalyzing(true)
      setError(null)
      
      const response = await fetch(`/api/history/records/${recordId}`)
      console.log('API response status:', response.status)
      
      const data = await response.json()
      console.log('API response data:', data)

      if (data.success && data.data) {
        const record = data.data
        console.log('Record analysis_type:', record.analysis_type)
        console.log('Record output_data:', record.output_data)
        
        if (record.analysis_type === 'hepan' && record.output_data) {
          setResult(record.output_data as HepanResult)
          console.log('Set result:', record.output_data)
        } else {
          setError('记录类型不匹配或没有输出数据')
        }
      } else {
        setError('加载历史记录失败: ' + (data.error || '未知错误'))
        console.error('Failed to load history record:', data.error)
      }
    } catch (error) {
      console.error('Error loading history record:', error)
      setError('加载历史记录时发生错误: ' + (error as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  console.log('Current state:', { result, isAnalyzing, error })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-amber-600 dark:text-amber-400'
    if (score >= 60) return 'text-slate-600 dark:text-slate-400'
    if (score >= 40) return 'text-amber-700 dark:text-amber-500'
    return 'text-slate-700 dark:text-slate-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '极佳'
    if (score >= 60) return '良好'
    if (score >= 40) return '一般'
    return '需改善'
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(135deg, 
        #fef7ed 0%, 
        #fdf2f8 20%, 
        #f0f9ff 40%,
        #fef3e2 60%, 
        #fef7ed 80%, 
        #fdf2f8 100%)`
    }}>
      {/* 增强版宋代美学背景装饰 */}
      <div className="absolute inset-0 opacity-30 dark:opacity-15">
        {/* 大型装饰圆环 */}
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-amber-300/40 dark:border-amber-600/30 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 right-24 w-32 h-32 border border-slate-400/40 dark:border-slate-500/30 rounded-full opacity-70"></div>
        
        {/* 中型装饰元素 */}
        <div className="absolute top-1/3 right-1/4 w-20 h-20 border border-amber-400/30 dark:border-amber-600/20 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 border-2 border-slate-300/40 dark:border-slate-600/30 rounded-full opacity-60"></div>
        
        {/* 小型点缀 */}
        <div className="absolute top-1/4 left-1/2 w-6 h-6 bg-amber-400/30 dark:bg-amber-600/20 rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/2 w-4 h-4 bg-slate-400/30 dark:bg-slate-600/20 rounded-full opacity-60"></div>
        <div className="absolute top-2/3 left-1/5 w-3 h-3 bg-amber-500/40 dark:bg-amber-700/30 rounded-full opacity-80"></div>
        <div className="absolute top-1/5 right-1/5 w-2 h-2 bg-slate-500/40 dark:bg-slate-700/30 rounded-full opacity-70"></div>
        
        {/* 梅花图案装饰 */}
        <div className="absolute top-1/2 left-1/6 transform -translate-y-1/2">
          <div className="relative w-8 h-8">
            <div className="absolute w-2 h-2 bg-amber-400/20 dark:bg-amber-600/15 rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-amber-400/20 dark:bg-amber-600/15 rounded-full top-1/2 left-0 transform -translate-y-1/2"></div>
            <div className="absolute w-2 h-2 bg-amber-400/20 dark:bg-amber-600/15 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
            <div className="absolute w-2 h-2 bg-amber-400/20 dark:bg-amber-600/15 rounded-full bottom-1 left-1/4"></div>
            <div className="absolute w-2 h-2 bg-amber-400/20 dark:bg-amber-600/15 rounded-full bottom-1 right-1/4"></div>
            <div className="absolute w-1 h-1 bg-amber-500/30 dark:bg-amber-700/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* 传统纹样 */}
        <div className="absolute bottom-1/5 right-1/6">
          <div className="relative w-12 h-12 border border-slate-300/20 dark:border-slate-600/15 rounded-full">
            <div className="absolute w-8 h-8 border border-amber-400/15 dark:border-amber-600/10 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-4 h-4 bg-gradient-to-br from-amber-300/10 to-slate-300/10 dark:from-amber-600/8 dark:to-slate-600/8 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>
      
      {/* 水墨渐变叠加 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-amber-100/10 dark:from-transparent dark:via-slate-900/5 dark:to-amber-900/5 pointer-events-none"></div>
      
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 页面标题 */}
            <section className="text-center mb-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-5xl font-serif font-bold mb-6 text-slate-800 dark:text-slate-200">
                  八字合盘分析
                </h2>
                <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                <p className="text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
                  基于传统八字命理，为您分析两人的感情配对和相处之道
                </p>
              </div>
            </section>

        {/* 调试信息 */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700">调试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-600 space-y-1">
              <div>isAnalyzing: {isAnalyzing ? 'true' : 'false'}</div>
              <div>error: {error || 'null'}</div>
              <div>result: {result ? 'exists' : 'null'}</div>
              {result && (
                <>
                  <div>overall_score: {result.compatibility_result?.compatibility?.overall_score || 'undefined'}</div>
                  <div>has detailed_scores: {result.compatibility_result?.detailed_scores ? 'true' : 'false'}</div>
                  <div className="mt-2 p-2 bg-white rounded text-xs text-gray-800">
                    <strong>完整数据结构:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

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
            </CardContent>
          </Card>
        )}

        {result && result.compatibility_result?.compatibility && (
          <div className="mb-8 grid lg:grid-cols-2 gap-8">
            {/* 圆形进度条总分 */}
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
                  综合匹配度
                </CardTitle>
                <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                <div className="flex justify-center">
                  <CircularProgress value={result.compatibility_result.compatibility.overall_score || 0} size={180}>
                    <div className="text-center">
                      <div className="text-4xl font-serif font-bold text-amber-600 dark:text-amber-400 drop-shadow-sm">
                        {result.compatibility_result.compatibility.overall_score || 0}
                      </div>
                      <div className="text-lg font-serif text-slate-500 dark:text-slate-400">分</div>
                    </div>
                  </CircularProgress>
                </div>
                <Badge variant="secondary" className="mt-4 bg-amber-700 dark:bg-amber-600 text-white font-serif px-4 py-1 shadow-lg">
                  {getScoreLabel(result.compatibility_result.compatibility.overall_score || 0)}
                </Badge>
              </CardHeader>
            </Card>

            {/* 雷达图对比 */}
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/80 to-amber-50/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
                  五维度能力对比
                </CardTitle>
                <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                <div className="flex justify-center">
                  <RadarChart 
                    size={260}
                    data={{
                      labels: ['感情和谐', '事业配合', '财运互补', '健康相助', '家庭和睦'],
                      datasets: [
                        {
                          label: result.person1_name || '第一人',
                          data: [
                            result.compatibility_result.detailed_scores?.love_score || 0,
                            result.compatibility_result.detailed_scores?.career_score || 0, 
                            result.compatibility_result.detailed_scores?.wealth_score || 0,
                            result.compatibility_result.detailed_scores?.health_score || 0,
                            result.compatibility_result.detailed_scores?.family_score || 0
                          ],
                          color: 'rgba(59, 130, 246, 0.8)',
                          fillColor: 'rgba(59, 130, 246, 0.2)'
                        },
                        {
                          label: result.person2_name || '第二人',
                          data: [
                            Math.min((result.compatibility_result.detailed_scores?.love_score || 0) + (Math.random() - 0.5) * 10, 100),
                            Math.min((result.compatibility_result.detailed_scores?.career_score || 0) + (Math.random() - 0.5) * 10, 100),
                            Math.min((result.compatibility_result.detailed_scores?.wealth_score || 0) + (Math.random() - 0.5) * 10, 100),
                            Math.min((result.compatibility_result.detailed_scores?.health_score || 0) + (Math.random() - 0.5) * 10, 100),
                            Math.min((result.compatibility_result.detailed_scores?.family_score || 0) + (Math.random() - 0.5) * 10, 100)
                          ],
                          color: 'rgba(236, 72, 153, 0.8)',
                          fillColor: 'rgba(236, 72, 153, 0.2)'
                        }
                      ]
                    }}
                  />
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {result && result.compatibility_result?.detailed_scores && (
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/95 to-amber-50/80 dark:from-slate-900/95 dark:to-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">感情和谐</CardTitle>
                <div className={`text-3xl font-serif font-bold ${getScoreColor(result.compatibility_result.detailed_scores.love_score || 0)} drop-shadow-sm mb-2`}>
                  {result.compatibility_result.detailed_scores.love_score || 0}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatedProgress 
                  value={result.compatibility_result.detailed_scores.love_score || 0} 
                  showLabel={false} 
                  height="h-3"
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/95 to-blue-50/80 dark:from-slate-900/95 dark:to-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">事业配合</CardTitle>
                <div className={`text-3xl font-serif font-bold ${getScoreColor(result.compatibility_result.detailed_scores.career_score || 0)} drop-shadow-sm mb-2`}>
                  {result.compatibility_result.detailed_scores.career_score || 0}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatedProgress 
                  value={result.compatibility_result.detailed_scores.career_score || 0} 
                  showLabel={false} 
                  height="h-3"
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/95 to-green-50/80 dark:from-slate-900/95 dark:to-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">财运互补</CardTitle>
                <div className={`text-3xl font-serif font-bold ${getScoreColor(result.compatibility_result.detailed_scores.wealth_score || 0)} drop-shadow-sm mb-2`}>
                  {result.compatibility_result.detailed_scores.wealth_score || 0}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatedProgress 
                  value={result.compatibility_result.detailed_scores.wealth_score || 0} 
                  showLabel={false} 
                  height="h-3"
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/95 to-purple-50/80 dark:from-slate-900/95 dark:to-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">健康相助</CardTitle>
                <div className={`text-3xl font-serif font-bold ${getScoreColor(result.compatibility_result.detailed_scores.health_score || 0)} drop-shadow-sm mb-2`}>
                  {result.compatibility_result.detailed_scores.health_score || 0}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatedProgress 
                  value={result.compatibility_result.detailed_scores.health_score || 0} 
                  showLabel={false} 
                  height="h-3"
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/95 to-pink-50/80 dark:from-slate-900/95 dark:to-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">家庭和睦</CardTitle>
                <div className={`text-3xl font-serif font-bold ${getScoreColor(result.compatibility_result.detailed_scores.family_score || 0)} drop-shadow-sm mb-2`}>
                  {result.compatibility_result.detailed_scores.family_score || 0}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatedProgress 
                  value={result.compatibility_result.detailed_scores.family_score || 0} 
                  showLabel={false} 
                  height="h-3"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI分析 */}
        {result && result.ai_analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI智能分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-slate-700">
                {result.ai_analysis}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析结果 - 宋代美学风格 */}
        {result && result.compatibility_result?.analysis && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-serif font-bold text-amber-700 dark:text-amber-400 mb-2">优势方面</CardTitle>
                <div className="w-12 h-px bg-amber-300 dark:bg-amber-600 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(result.compatibility_result.analysis.strengths || []).map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">{strength}</span>
                    </li>
                  ))}
                  {(!result.compatibility_result.analysis.strengths || result.compatibility_result.analysis.strengths.length === 0) && (
                    <li className="text-sm font-serif text-slate-500 dark:text-slate-400 italic">暂无优势分析</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-serif font-bold text-amber-700 dark:text-amber-400 mb-2">挑战方面</CardTitle>
                <div className="w-12 h-px bg-amber-300 dark:bg-amber-600 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(result.compatibility_result.analysis.challenges || []).map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">{challenge}</span>
                    </li>
                  ))}
                  {(!result.compatibility_result.analysis.challenges || result.compatibility_result.analysis.challenges.length === 0) && (
                    <li className="text-sm font-serif text-slate-500 dark:text-slate-400 italic">暂无挑战分析</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-serif font-bold text-slate-700 dark:text-slate-400 mb-2">改善建议</CardTitle>
                <div className="w-12 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(result.compatibility_result.analysis.suggestions || []).map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-slate-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">{suggestion}</span>
                    </li>
                  ))}
                  {(!result.compatibility_result.analysis.suggestions || result.compatibility_result.analysis.suggestions.length === 0) && (
                    <li className="text-sm font-serif text-slate-500 dark:text-slate-400 italic">暂无改善建议</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && !isAnalyzing && !error && (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardContent className="py-8 text-center">
              <p className="font-serif text-slate-600 dark:text-slate-400">没有找到分析结果</p>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮区域 */}
        {result && (
          <div className="text-center space-x-4 mb-12">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-serif shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新分析
            </Button>
            <Link href="/history">
              <Button 
                variant="outline" 
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                查看历史记录
              </Button>
            </Link>
          </div>
        )}

        {/* 分析已保存提示 */}
        {result && (
          <div className="mb-8">
            <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-amber-800 dark:text-amber-200">
                    分析已保存
                  </h3>
                </div>
                <p className="text-amber-700 dark:text-amber-300 font-serif mb-4">
                  本次分析结果已自动保存到您的历史记录中，您可以随时查看和回顾所有分析结果。
                </p>
                <Link href="/history">
                  <Button variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-serif">
                    <Calendar className="h-4 w-4 mr-2" />
                    查看历史记录
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </main>

        {/* Footer - 宋代美学风格 */}
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16 relative">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-slate-600 dark:text-slate-400">
              <p className="font-serif">&copy; 2024 天机AI. 传统智慧，现代科技</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}