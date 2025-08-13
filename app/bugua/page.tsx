'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Coins, Clock, Zap, RefreshCw, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { CoinFlipAnimation, SimpleCoin } from '@/components/ui/coin-flip-animation'

interface BuguaResult {
  success: boolean
  question: {
    question: string
    category: string
    urgency: string
  }
  hexagram: {
    upper: string
    lower: string
    name: string
    number: number
    meaning: string
    element: string
    fortune: string
  }
  interpretation: {
    overall: string
    advice: string
    timing: string
    caution: string
  }
  details: {
    upper_gua_analysis: string
    lower_gua_analysis: string
    interaction: string
    five_elements: string
  }
  scores: {
    success_rate: number
    risk_level: number
    timing_score: number
    overall_score: number
  }
  timeframe: {
    short_term: string
    medium_term: string
    long_term: string
  }
  ai_analysis: string
  cost: number
  method: string
  error?: string
}

export default function BuguaPage() {
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState<string>('')
  const [urgency, setUrgency] = useState<string>('')
  const [method, setMethod] = useState<'time' | 'coins'>('time')
  const [coinResults, setCoinResults] = useState<number[]>([])
  const [currentCoinThrow, setCurrentCoinThrow] = useState(0)
  const [isThrowingCoins, setIsThrowingCoins] = useState(false)
  const [shouldResetCoins, setShouldResetCoins] = useState(false)
  const [result, setResult] = useState<BuguaResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'career', label: '事业工作' },
    { value: 'love', label: '感情婚姻' }, 
    { value: 'wealth', label: '财运投资' },
    { value: 'health', label: '健康身体' },
    { value: 'study', label: '学习考试' },
    { value: 'family', label: '家庭关系' },
    { value: 'travel', label: '出行旅游' },
    { value: 'other', label: '其他事务' }
  ]

  const urgencyLevels = [
    { value: 'high', label: '紧急重要' },
    { value: 'medium', label: '一般重要' },
    { value: 'low', label: '不太紧急' }
  ]

  const validateForm = (): boolean => {
    if (!question.trim()) {
      setError('请输入您要占卜的问题')
      return false
    }
    if (!category) {
      setError('请选择问题类别')
      return false
    }
    if (!urgency) {
      setError('请选择紧急程度')
      return false
    }
    if (method === 'coins' && coinResults.length !== 6) {
      setError('硬币占卜法需要完成6次投币')
      return false
    }
    return true
  }

  const handleCoinThrow = () => {
    if (currentCoinThrow >= 6) return
    
    // 开始新的投币时重置硬币状态
    setShouldResetCoins(true)
    setTimeout(() => setShouldResetCoins(false), 100) // 短暂重置后恢复
    
    setIsThrowingCoins(true)
  }

  const handleFlipComplete = (result: number) => {
    const newResults = [...coinResults, result]
    setCoinResults(newResults)
    setCurrentCoinThrow(currentCoinThrow + 1)
    setIsThrowingCoins(false)
  }

  const resetCoins = () => {
    setCoinResults([])
    setCurrentCoinThrow(0)
    setShouldResetCoins(true)
    setTimeout(() => setShouldResetCoins(false), 100)
  }

  const handleAnalyze = async () => {
    if (!validateForm()) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const requestBody = {
        question: question.trim(),
        category,
        urgency,
        method,
        ...(method === 'coins' && { coin_results: coinResults })
      }

      const response = await fetch('/api/bugua/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '卜卦分析失败')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请稍后重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setQuestion('')
    setCategory('')
    setUrgency('')
    setMethod('time')
    resetCoins()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFortuneColor = (fortune: string) => {
    if (fortune.includes('大吉')) return 'text-green-600'
    if (fortune.includes('吉')) return 'text-blue-600'
    if (fortune.includes('平')) return 'text-gray-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(45deg, 
        #fef7ed 0%, 
        #fef3e2 25%, 
        #fdf4ff 50%, 
        #fff7ed 75%, 
        #fef3e2 100%)`
    }}>
      {/* 宋代美学背景装饰 */}
      <div className="absolute inset-0 opacity-30 dark:opacity-15">
        <div className="absolute top-32 left-32 w-32 h-32 border-2 border-amber-300 dark:border-amber-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-orange-400 dark:border-orange-500 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-amber-300 dark:bg-amber-600 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-orange-400 dark:bg-orange-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-6 border border-amber-400 dark:border-amber-500 rounded-full opacity-30"></div>
      </div>
      
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">

          {!result && !isAnalyzing && (
            <>
              {/* 页面介绍 - 宋代美学风格 */}
              <section className="text-center mb-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-5xl font-serif font-bold mb-6 text-amber-800 dark:text-amber-200">
                    易经卜卦占问
                  </h2>
                  <div className="w-24 h-px bg-amber-300 dark:bg-amber-600 mx-auto mb-6"></div>
                  <p className="text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                    基于传统易经六十四卦理论，通过时间起卦或硬币占卜，
                    为您的人生疑问提供智慧指引和决策参考。
                  </p>
                  <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>易经智慧</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4" />
                      <span>多种起卦法</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>AI深度解析</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 输入表单 - 宋代美学风格 */}
              <section className="mb-12">
                <Card className="max-w-4xl mx-auto shadow-lg border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-300 mb-2">
                      请诚心问卜
                    </CardTitle>
                    <div className="w-16 h-px bg-amber-300 dark:bg-amber-600 mx-auto mb-2"></div>
                    <CardDescription className="text-base font-serif text-slate-600 dark:text-slate-400">
                      请详细描述您要占卜的问题，问题越具体，卦象指引越准确
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 问题输入 */}
                    <div>
                      <Label htmlFor="question">占卜问题 *</Label>
                      <Textarea
                        id="question"
                        placeholder="请详细描述您要占卜的问题，例如：我是否应该在近期换工作？"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* 问题分类和紧急程度 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">问题类别 *</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="请选择问题类别" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="urgency">紧急程度 *</Label>
                        <Select value={urgency} onValueChange={setUrgency}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="请选择紧急程度" />
                          </SelectTrigger>
                          <SelectContent>
                            {urgencyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 起卦方法选择 */}
                    <div>
                      <Label>起卦方法</Label>
                      <div className="flex gap-4 mt-2">
                        <Button
                          variant={method === 'time' ? 'default' : 'outline'}
                          onClick={() => setMethod('time')}
                          className="flex items-center space-x-2"
                        >
                          <Clock className="h-4 w-4" />
                          <span>时间起卦</span>
                        </Button>
                        <Button
                          variant={method === 'coins' ? 'default' : 'outline'}
                          onClick={() => setMethod('coins')}
                          className="flex items-center space-x-2"
                        >
                          <Coins className="h-4 w-4" />
                          <span>硬币占卜</span>
                        </Button>
                      </div>
                    </div>

                    {/* 硬币占卜界面 - 宋代美学风格 */}
                    {method === 'coins' && (
                      <Card className="bg-gradient-to-br from-slate-50/80 to-amber-50/50 dark:from-slate-800/80 dark:to-amber-950/20 border border-amber-200 dark:border-amber-700/50 shadow-lg">
                        <CardHeader className="text-center">
                          <CardTitle className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200">硬币占卜法</CardTitle>
                          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3"></div>
                          <CardDescription className="font-serif text-slate-700 dark:text-slate-300 text-base">
                            需要进行6次投币，每次投掷3枚硬币。请专心致志，心中默念问题。
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="text-center">
                            <div className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-4">
                              第 {currentCoinThrow + 1} 次投币
                              {currentCoinThrow >= 6 ? ' - 已完成' : ''}
                            </div>
                          </div>
                          
                          {/* 3D硬币翻转动画 */}
                          <div className="min-h-[200px] relative bg-white/50 dark:bg-slate-800/30 rounded-xl border border-amber-200/50 dark:border-amber-700/30 backdrop-blur-sm">
                            {(isThrowingCoins || coinResults.length > 0) ? (
                              <CoinFlipAnimation 
                                isFlipping={isThrowingCoins}
                                coinResults={coinResults}
                                currentThrow={currentCoinThrow}
                                onFlipComplete={handleFlipComplete}
                                shouldReset={shouldResetCoins}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400 font-serif">
                                {currentCoinThrow >= 6 ? '投币已完成，可以开始卜卦' : '点击下方按钮开始投币'}
                              </div>
                            )}
                          </div>
                          
                          {/* 操作按钮 */}
                          <div className="text-center">
                            {currentCoinThrow < 6 ? (
                              <Button
                                onClick={handleCoinThrow}
                                disabled={isThrowingCoins}
                                size="lg"
                                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-serif px-8 py-3 shadow-lg transform transition-transform hover:scale-105"
                              >
                                {isThrowingCoins ? (
                                  <>
                                    <div className="animate-pulse mr-2">🪙</div>
                                    <span className="font-serif">投币中...</span>
                                  </>
                                ) : (
                                  <>
                                    <Coins className="h-5 w-5 mr-2" />
                                    <span className="font-serif">投掷 3 枚硬币</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button 
                                onClick={resetCoins} 
                                variant="outline" 
                                className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 font-serif hover:bg-amber-50 dark:hover:bg-amber-950/20"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                重新投币
                              </Button>
                            )}
                          </div>

                          {/* 投币历史记录 */}
                          {coinResults.length > 0 && (
                            <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/30">
                              <h4 className="text-center font-serif font-semibold text-amber-800 dark:text-amber-200 mb-4">
                                投币历史记录
                              </h4>
                              <div className="grid grid-cols-6 gap-3">
                                {Array.from({ length: 6 }, (_, i) => (
                                  <div key={i} className="text-center">
                                    <div className="text-xs font-serif text-muted-foreground mb-2">
                                      第{i + 1}次
                                    </div>
                                    <SimpleCoin 
                                      result={i < coinResults.length ? coinResults[i] : undefined}
                                      isActive={i === currentCoinThrow}
                                    />
                                    <div className="text-xs font-serif mt-1 text-slate-600 dark:text-slate-400">
                                      {i < coinResults.length ? `${coinResults[i]}正面` : '待投'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* 开始卜卦按钮 - 宋代美学风格 */}
                    <div className="text-center pt-4">
                      <Button 
                        onClick={handleAnalyze}
                        size="lg"
                        className="bg-amber-700 dark:bg-amber-600 hover:bg-amber-800 dark:hover:bg-amber-700 text-white font-serif px-12 shadow-lg"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span className="font-serif">卜卦中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            <span className="font-serif">开始卜卦 (消耗 150 天机点)</span>
                          </>
                        )}
                      </Button>
                      <p className="text-sm font-serif text-slate-600 dark:text-slate-400 mt-2">
                        卜卦完成后将消耗 150 天机点
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* 分析中状态 - 宋代美学风格 */}
          {isAnalyzing && (
            <section className="text-center py-16">
              <Card className="max-w-2xl mx-auto border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-slate-900/90">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent"></div>
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-semibold mb-2 text-slate-700 dark:text-slate-300">正在为您卜卦分析...</h3>
                      <p className="text-base font-serif text-slate-600 dark:text-slate-400 mb-4">
                        {method === 'time' ? '根据时间起卦，计算卦象变化' : '解析硬币结果，推演卦象含义'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-serif">生成卦象</Badge>
                        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-serif">分析卦辞</Badge>
                        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-serif">判断吉凶</Badge>
                        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-serif">推算时机</Badge>
                        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-serif">AI智能解读</Badge>
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
                  <Button onClick={() => setError(null)} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新卜卦
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 卜卦结果 - 宋代美学风格 */}
          {result && (
            <section>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-bold text-amber-700 dark:text-amber-300 mb-4">卜卦结果</h3>
                <div className="w-24 h-px bg-amber-300 dark:bg-amber-600 mx-auto mb-6"></div>
                <Button onClick={handleReset} variant="outline" className="font-serif border-amber-300 dark:border-amber-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新卜卦
                </Button>
              </div>

              {/* 卦象展示 - 宋代美学风格 */}
              <Card className="mb-8 shadow-lg border border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-800/50">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4 text-amber-800 dark:text-amber-200">
                    {result.hexagram.upper}{result.hexagram.lower}
                  </div>
                  <div className="w-16 h-px bg-amber-300 dark:bg-amber-600 mx-auto mb-4"></div>
                  <CardTitle className="text-3xl font-serif font-bold text-amber-800 dark:text-amber-200">
                    {result.hexagram.name}
                  </CardTitle>
                  <CardDescription className="text-lg font-serif text-slate-600 dark:text-slate-400 mt-2">
                    {result.hexagram.meaning}
                  </CardDescription>
                  <div className="flex justify-center space-x-4 mt-6">
                    <Badge variant="secondary" className="bg-amber-700 dark:bg-amber-600 text-white font-serif px-3 py-1">五行: {result.hexagram.element}</Badge>
                    <Badge className={`${getFortuneColor(result.hexagram.fortune)} font-serif px-3 py-1`}>
                      {result.hexagram.fortune}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* 评分展示 - 宋代美学风格 */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">成功概率</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-300 drop-shadow-sm">
                      {result.scores.success_rate}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">风险等级</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-300 drop-shadow-sm">
                      {result.scores.risk_level}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">时机评分</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-300 drop-shadow-sm">
                      {result.scores.timing_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">综合评分</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-300 drop-shadow-sm">
                      {result.scores.overall_score}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI智能解读 - 结构化展示 */}
              <Card className="mb-8 border border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                      AI智能解读
                    </CardTitle>
                  </div>
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto"></div>
                  <CardDescription className="text-sm font-serif text-slate-600 dark:text-slate-400 mt-3">
                    基于易经理论结合现代AI技术的深度分析
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {/* 解析AI分析内容并分块展示 */}
                  {(() => {
                    const analysisText = typeof result.ai_analysis === 'string' 
                      ? result.ai_analysis 
                      : JSON.stringify(result.ai_analysis, null, 2)
                    
                    // 尝试解析结构化内容 - 宋代美学风格
                    const sections = [
                      { title: '卦象解读', icon: '☰', color: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700' },
                      { title: '行动指南', icon: '☯', color: 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700' },
                      { title: '时机把握', icon: '☱', color: 'bg-slate-50/80 dark:bg-slate-800/30 border-slate-200 dark:border-slate-600' },
                      { title: '风险预警', icon: '☲', color: 'bg-yellow-50/80 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700' },
                      { title: '成功要素', icon: '☳', color: 'bg-stone-50/80 dark:bg-stone-900/30 border-stone-200 dark:border-stone-600' }
                    ]
                    
                    // 分割内容为不同段落
                    const paragraphs = analysisText.split('\n').filter(line => line.trim())
                    
                    // 尝试根据关键词匹配段落到对应部分
                    const sectionContent: { [key: string]: string[] } = {}
                    let currentSection = ''
                    
                    for (const paragraph of paragraphs) {
                      if (paragraph.includes('【卦象解读】') || paragraph.includes('卦象')) {
                        currentSection = '卦象解读'
                      } else if (paragraph.includes('【行动指南】') || paragraph.includes('建议') || paragraph.includes('行动')) {
                        currentSection = '行动指南'
                      } else if (paragraph.includes('【时机把握】') || paragraph.includes('时机') || paragraph.includes('时间')) {
                        currentSection = '时机把握'
                      } else if (paragraph.includes('【风险预警】') || paragraph.includes('风险') || paragraph.includes('注意')) {
                        currentSection = '风险预警'
                      } else if (paragraph.includes('【成功要素】') || paragraph.includes('成功') || paragraph.includes('关键')) {
                        currentSection = '成功要素'
                      }
                      
                      if (currentSection && !paragraph.startsWith('【')) {
                        if (!sectionContent[currentSection]) {
                          sectionContent[currentSection] = []
                        }
                        sectionContent[currentSection].push(paragraph)
                      }
                    }
                    
                    // 如果没有结构化内容，则展示原始分析
                    const hasStructuredContent = Object.keys(sectionContent).length > 0
                    
                    if (!hasStructuredContent) {
                      return (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-amber-200/50 dark:border-amber-700/50 shadow-inner">
                          <div className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">
                            {paragraphs.map((paragraph, index) => (
                              <p key={index} className="mb-4 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <div className="space-y-4">
                        {sections.map((section, index) => {
                          const content = sectionContent[section.title]
                          if (!content || content.length === 0) return null
                          
                          return (
                            <div 
                              key={index} 
                              className={`rounded-xl p-6 border ${section.color} shadow-sm backdrop-blur-sm`}
                            >
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-md">
                                  <span className="text-white text-xl font-bold">{section.icon}</span>
                                </div>
                                <h4 className="text-xl font-serif font-bold text-amber-800 dark:text-amber-200">
                                  {section.title}
                                </h4>
                              </div>
                              <div className="text-base font-serif leading-8 text-slate-800 dark:text-slate-200">
                                {content.map((paragraph, pIndex) => (
                                  <p key={pIndex} className="mb-4 last:mb-0">
                                    {paragraph.replace(/^【.*?】\s*/, '')}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* 如果有其他未分类的内容，在最后显示 */}
                        {(() => {
                          const uncategorized = paragraphs.filter(p => {
                            return !Object.values(sectionContent).flat().includes(p) && 
                                   !p.startsWith('【') && 
                                   p.trim().length > 0
                          })
                          
                          if (uncategorized.length === 0) return null
                          
                          return (
                            <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-6 border border-amber-200 dark:border-amber-700 shadow-sm backdrop-blur-sm">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-md">
                                  <span className="text-white text-xl font-bold">☴</span>
                                </div>
                                <h4 className="text-xl font-serif font-bold text-amber-800 dark:text-amber-200">
                                  综合分析
                                </h4>
                              </div>
                              <div className="text-base font-serif leading-8 text-slate-800 dark:text-slate-200">
                                {uncategorized.map((paragraph, index) => (
                                  <p key={index} className="mb-4 last:mb-0">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })()}
                  
                  {/* 底部装饰 */}
                  <div className="flex items-center justify-center mt-6 space-x-2">
                    <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                    <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-300"></div>
                    <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                  </div>
                </CardContent>
              </Card>

              {/* 基础解释 - 宋代美学风格 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/30 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-800 dark:text-amber-200 font-serif text-lg font-bold">总体解释</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.interpretation.overall}</p>
                  </CardContent>
                </Card>

                <Card className="border border-orange-200 dark:border-orange-700 bg-orange-50/80 dark:bg-orange-950/30 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-orange-800 dark:text-orange-200 font-serif text-lg font-bold">行动建议</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.interpretation.advice}</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/30 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-slate-700 dark:text-slate-300 font-serif text-lg font-bold">时机把握</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.interpretation.timing}</p>
                  </CardContent>
                </Card>

                <Card className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50/80 dark:bg-yellow-950/30 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-yellow-800 dark:text-yellow-200 font-serif text-lg font-bold">注意事项</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.interpretation.caution}</p>
                  </CardContent>
                </Card>
              </div>

              {/* 时间预测 - 宋代美学风格 */}
              <Card className="mb-8 border border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-2">时间预测</CardTitle>
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-xl">☷</span>
                      </div>
                      <h4 className="font-serif font-bold text-amber-800 dark:text-amber-200 mb-3 text-lg">近期 (1-3个月)</h4>
                      <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.timeframe.short_term}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-xl">☶</span>
                      </div>
                      <h4 className="font-serif font-bold text-orange-800 dark:text-orange-200 mb-3 text-lg">中期 (3-12个月)</h4>
                      <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.timeframe.medium_term}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-stone-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-xl">☵</span>
                      </div>
                      <h4 className="font-serif font-bold text-slate-700 dark:text-slate-300 mb-3 text-lg">远期 (1-3年)</h4>
                      <p className="text-base font-serif leading-7 text-slate-800 dark:text-slate-200">{result.timeframe.long_term}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 操作按钮 - 宋代美学风格 */}
              <div className="text-center space-x-4">
                <Button onClick={handleReset} className="bg-amber-700 dark:bg-amber-600 hover:bg-amber-800 dark:hover:bg-amber-700 text-white font-serif">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新卜卦
                </Button>
                <Button variant="outline" className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 font-serif">
                  <Sparkles className="h-4 w-4 mr-2" />
                  保存卦象
                </Button>
                <Button variant="outline" className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 font-serif">
                  分享结果
                </Button>
              </div>

              {/* 历史记录提示 - 宋代美学风格 */}
              <div className="mt-8">
                <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-orange-800 dark:text-orange-200">
                        卦象已保存
                      </h3>
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 font-serif mb-4">
                      本次卜卦结果已自动保存到您的历史记录中，您可以随时查看和回顾所有卦象分析。
                    </p>
                    <Link href="/history">
                      <Button variant="outline" className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 font-serif">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        查看历史记录
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer - 宋代美学风格 */}
      <footer className="border-t border-amber-200 dark:border-amber-700 bg-amber-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16 relative">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-amber-600 dark:text-amber-400">
            <p className="font-serif">&copy; 2024 天机AI. 传统智慧，现代科技</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}