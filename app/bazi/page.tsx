'use client'

import { useState } from 'react'
import { BaziInputForm } from '@/components/forms/BaziInputForm'
import { BaziResult } from '@/components/modules/BaziResult'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, Sparkles, ArrowLeft, RefreshCw, Download, Share2, Copy, Check, Calendar } from 'lucide-react'
import Link from 'next/link'

interface BaziAnalysisResponse {
  success?: boolean
  bazi: {
    year_ganzhi: string
    month_ganzhi: string
    day_ganzhi: string
    hour_ganzhi: string
  }
  wuxing_analysis: {
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
  dayun?: any[]
  ai_analysis: string
  yongshen: string
  cost: number
  error?: string
}

export default function BaziPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BaziAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<BaziAnalysisResponse[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleAnalysisComplete = (data: BaziAnalysisResponse) => {
    setResult(data)
    setLoading(false)
    setError(null)
    
    // 添加到历史记录
    setAnalysisHistory(prev => [data, ...prev.slice(0, 4)]) // 保留最近5次记录
  }

  const handleAnalysisStart = () => {
    setLoading(true)
    setError(null)
    setResult(null)
  }

  const handleNewAnalysis = () => {
    setResult(null)
    setError(null)
    setLoading(false)
  }

  const handleSaveReport = async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      // 创建报告内容
      const reportContent = generateReportContent(result)
      
      // 创建并下载文件
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `八字分析报告_${new Date().toLocaleDateString()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('保存报告失败:', error)
      alert('保存报告失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareResult = async () => {
    if (!result) return
    
    setIsSharing(true)
    try {
      const shareText = generateShareContent(result)
      
      if (navigator.share) {
        // 使用Web Share API（移动端支持较好）
        await navigator.share({
          title: '天机AI - 八字分析结果',
          text: shareText,
          url: window.location.href
        })
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('分享失败:', error)
      // 降级到复制链接
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (clipError) {
        alert('分享失败，请手动复制链接')
      }
    } finally {
      setIsSharing(false)
    }
  }

  const generateReportContent = (data: BaziAnalysisResponse): string => {
    const date = new Date().toLocaleDateString('zh-CN')
    return `
==============================
天机AI - 八字命盘分析报告
生成时间：${date}
==============================

【八字四柱】
年柱：${data.bazi.year_ganzhi}
月柱：${data.bazi.month_ganzhi}  
日柱：${data.bazi.day_ganzhi} [日主]
时柱：${data.bazi.hour_ganzhi}

【五行分析】
木：${data.wuxing_analysis.wood}个 (${data.wuxing_analysis.percentages?.wood?.toFixed(1) || 0}%)
火：${data.wuxing_analysis.fire}个 (${data.wuxing_analysis.percentages?.fire?.toFixed(1) || 0}%)
土：${data.wuxing_analysis.earth}个 (${data.wuxing_analysis.percentages?.earth?.toFixed(1) || 0}%)
金：${data.wuxing_analysis.metal}个 (${data.wuxing_analysis.percentages?.metal?.toFixed(1) || 0}%)
水：${data.wuxing_analysis.water}个 (${data.wuxing_analysis.percentages?.water?.toFixed(1) || 0}%)

最强五行：${data.wuxing_analysis.strongest}
最弱五行：${data.wuxing_analysis.weakest}
用神：${data.yongshen}

【AI智能分析】
${typeof data.ai_analysis === 'string' ? data.ai_analysis : JSON.stringify(data.ai_analysis, null, 2)}

==============================
本次分析消耗：${data.cost} 天机点
报告由天机AI生成 - 仅供参考
==============================
    `
  }

  const generateShareContent = (data: BaziAnalysisResponse): string => {
    return `🔮 我在天机AI完成了八字分析！

📊 八字：${data.bazi.year_ganzhi} ${data.bazi.month_ganzhi} ${data.bazi.day_ganzhi} ${data.bazi.hour_ganzhi}
⚖️ 用神：${data.yongshen}
🌟 获得了专业的12维度深度解读

想了解自己的命理吗？来试试天机AI吧！
#八字分析 #命理 #天机AI`
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(45deg, 
        #f0fdfa 0%, 
        #ecfdf5 25%, 
        #f0fdf4 50%, 
        #ecfccb 75%, 
        #f0fdfa 100%)`
    }}>
      {/* 宋代美学背景装饰 */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div className="absolute top-32 left-32 w-32 h-32 border-2 border-teal-300 dark:border-teal-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-emerald-400 dark:border-emerald-500 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-teal-300 dark:bg-teal-600 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-emerald-400 dark:bg-emerald-600 rounded-full opacity-50"></div>
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
          
          {!result && !loading && (
            <>
              {/* 页面介绍 - 宋代美学风格 */}
              <section className="text-center mb-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-5xl font-serif font-bold mb-6 text-teal-800 dark:text-teal-200">
                    八字命盘分析
                  </h2>
                  <div className="w-24 h-px bg-teal-300 dark:bg-teal-600 mx-auto mb-6"></div>
                  <p className="text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                    基于传统天干地支理论，结合现代AI智能技术，为您提供专业深入的命理分析。
                    涵盖八字排盘、五行配置、大运推算、用神判断等传统命理精要。
                  </p>
                  <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>精准排盘算法</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI智能解读</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>实时分析</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 输入表单 - 宋代美学风格 */}
              <section className="mb-12">
                <Card className="max-w-4xl mx-auto shadow-lg border border-teal-200 dark:border-teal-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-serif font-bold text-teal-700 dark:text-teal-300 mb-2">
                      生辰八字信息
                    </CardTitle>
                    <div className="w-16 h-px bg-teal-300 dark:bg-teal-600 mx-auto mb-2"></div>
                    <CardDescription className="text-base font-serif text-teal-600 dark:text-teal-400">
                      请填写准确的出生信息，AI将为您排出精准的八字命盘
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BaziInputForm 
                      onAnalysisStart={handleAnalysisStart}
                      onAnalysisComplete={handleAnalysisComplete}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* 历史记录 - 宋代美学风格 */}
              {analysisHistory.length > 0 && (
                <section>
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-serif font-bold text-teal-700 dark:text-teal-300 mb-4">最近分析记录</h3>
                    <div className="w-24 h-px bg-teal-300 dark:bg-teal-600 mx-auto"></div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysisHistory.map((history, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow border border-teal-200 dark:border-teal-700 bg-white/90 dark:bg-slate-900/90" onClick={() => setResult(history)}>
                        <CardHeader>
                          <CardTitle className="text-lg font-serif text-teal-700 dark:text-teal-300">分析记录 #{analysisHistory.length - index}</CardTitle>
                          <CardDescription className="font-serif">
                            八字：{history.bazi?.year_ganzhi} {history.bazi?.month_ganzhi} {history.bazi?.day_ganzhi} {history.bazi?.hour_ganzhi}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 font-serif">用神：{history.yongshen}</Badge>
                            <Button size="sm" variant="ghost" className="font-serif text-teal-700 dark:text-teal-300">查看详情</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* 分析中状态 */}
          {loading && (
            <section className="text-center py-16">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                      <Calculator className="absolute inset-0 m-auto h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">正在进行八字分析...</h3>
                      <p className="text-muted-foreground mb-4">
                        AI正在为您计算真太阳时、排列四柱、分析五行格局
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary">计算真太阳时</Badge>
                        <Badge variant="secondary">排列年月日时四柱</Badge>
                        <Badge variant="secondary">分析五行强弱</Badge>
                        <Badge variant="secondary">推算十年大运</Badge>
                        <Badge variant="secondary">判断格局用神</Badge>
                        <Badge variant="secondary">AI智能解读</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 错误显示 */}
          {error && (
            <section className="text-center py-8">
              <Card className="max-w-2xl mx-auto border-red-200">
                <CardContent className="pt-6">
                  <div className="text-center text-red-600 mb-4">
                    <p className="text-lg font-semibold">{error}</p>
                  </div>
                  <Button onClick={handleNewAnalysis} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新分析
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 分析结果 - 宋代美学风格 */}
          {result && (
            <section>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-bold text-teal-700 dark:text-teal-300 mb-4">八字命盘分析结果</h3>
                <div className="w-24 h-px bg-teal-300 dark:bg-teal-600 mx-auto mb-6"></div>
                <Button onClick={handleNewAnalysis} variant="outline" className="font-serif border-teal-300 dark:border-teal-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
              </div>
              
              <div className="bg-teal-50/50 dark:bg-teal-800/50 rounded-lg p-6 border border-teal-200 dark:border-teal-700">
                <BaziResult 
                  bazi={result.bazi}
                  wuxingAnalysis={result.wuxing_analysis}
                  dayun={result.dayun || []}
                  yongshen={result.yongshen}
                  aiAnalysis={result.ai_analysis}
                  cost={result.cost}
                />
              </div>

              {/* 操作按钮 - 宋代美学风格 */}
              <div className="mt-8 text-center space-x-4">
                <Button onClick={handleNewAnalysis} className="bg-teal-700 dark:bg-teal-600 hover:bg-teal-800 dark:hover:bg-teal-700 text-white font-serif">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 font-serif"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? '保存中...' : '保存报告'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShareResult}
                  disabled={isSharing}
                  className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 font-serif"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-emerald-500" />
                  ) : isSharing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  {copied ? '已复制' : isSharing ? '分享中...' : '分享结果'}
                </Button>
              </div>

              {/* 历史记录提示 - 宋代美学风格 */}
              <div className="mt-8">
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-emerald-800 dark:text-emerald-200">
                        分析已保存
                      </h3>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 font-serif mb-4">
                      本次八字分析结果已自动保存到您的历史记录中，您可以随时查看和回顾所有分析结果。
                    </p>
                    <Link href="/history">
                      <Button variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-serif">
                        <Calendar className="h-4 w-4 mr-2" />
                        查看历史记录
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer - 宋代美学风格 */}
      <footer className="border-t border-teal-200 dark:border-teal-700 bg-teal-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16 relative">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-teal-600 dark:text-teal-400">
            <p className="font-serif">&copy; 2024 天机AI. 传统智慧，现代科技</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}