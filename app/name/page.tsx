'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateSelector } from '@/components/ui/date-selector'
import { TimeSelector } from '@/components/ui/time-selector'
import { CitySelector } from '@/components/ui/city-selector'
import { User, Sparkles, RefreshCw, BookOpen, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'

interface NameAnalysisResult {
  success: boolean
  name: string
  analysis_type: 'current' | 'suggestion'
  basic_info: {
    surname: string
    given_name: string
    total_strokes: number
    surname_strokes: number
    given_strokes: number
  }
  wuxing_analysis: {
    surname_wuxing: string
    given_wuxing: string[]
    overall_wuxing: string
    wuxing_balance: {
      wood: number
      fire: number
      earth: number
      metal: number
      water: number
    }
    wuxing_compatibility: string
  }
  numerology: {
    tiange: number
    dige: number
    renge: number
    waige: number
    zongge: number
    tiange_fortune: string
    dige_fortune: string
    renge_fortune: string
    waige_fortune: string
    zongge_fortune: string
  }
  phonetics: {
    tones: number[]
    tone_harmony: string
    pronunciation_difficulty: string
    rhyme_quality: string
  }
  meanings: {
    positive_meanings: string[]
    potential_issues: string[]
    cultural_connotations: string[]
  }
  scores: {
    wuxing_score: number
    numerology_score: number
    phonetic_score: number
    meaning_score: number
    overall_score: number
  }
  suggestions: {
    strengths: string[]
    weaknesses: string[]
    improvement_suggestions: string[]
    lucky_directions: string[]
    suitable_careers: string[]
  }
  ai_analysis: string
  cost: number
  error?: string
}

export default function NameAnalysisPage() {
  const [formData, setFormData] = useState({
    name: '',
    analysis_type: 'current' as 'current' | 'suggestion',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    gender: 'male' as 'male' | 'female'
  })

  const [result, setResult] = useState<NameAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const { name } = formData
    if (!name) {
      setError('请输入要分析的姓名')
      return false
    }
    if (name.length < 2 || name.length > 4) {
      setError('姓名长度应为2-4个汉字')
      return false
    }
    const chineseRegex = /^[\u4e00-\u9fa5]+$/
    if (!chineseRegex.test(name)) {
      setError('请输入有效的中文姓名')
      return false
    }
    return true
  }

  const handleAnalyze = async () => {
    if (!validateForm()) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const requestData = {
        name: formData.name,
        analysis_type: formData.analysis_type,
        ...(formData.birth_date && { birth_date: formData.birth_date }),
        ...(formData.birth_time && { birth_time: formData.birth_time }),
        ...(formData.birth_city && { birth_city: formData.birth_city }),
        ...(formData.birth_date && { gender: formData.gender })
      }

      const response = await fetch('/api/name/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '姓名分析失败')
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
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 60) return <TrendingUp className="h-4 w-4" />
    if (score >= 40) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const getFortuneColor = (fortune: string) => {
    if (fortune === '大吉') return 'text-green-600 bg-green-50'
    if (fortune === '吉') return 'text-blue-600 bg-blue-50'
    if (fortune === '半吉') return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getWuxingColor = (wuxing: string) => {
    const colors = {
      '木': 'bg-green-100 text-green-800',
      '火': 'bg-red-100 text-red-800',
      '土': 'bg-yellow-100 text-yellow-800',
      '金': 'bg-gray-100 text-gray-800',
      '水': 'bg-blue-100 text-blue-800'
    }
    return colors[wuxing as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div className="absolute top-32 left-32 w-32 h-32 border-2 border-slate-300 dark:border-slate-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-slate-400 dark:border-slate-500 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-amber-400 dark:bg-amber-600 rounded-full opacity-50"></div>
      </div>
      
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">

          {!result && !isAnalyzing && (
            <>
              {/* 页面介绍 - 宋代美学风格 */}
              <section className="text-center mb-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-5xl font-serif font-bold mb-6 text-slate-800 dark:text-slate-200">
                    姓名学分析
                  </h2>
                  <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                  <p className="text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                    基于传统姓名学理论，分析姓名的五行配置、数理吉凶、音韵特点等。
                    为您提供专业的姓名评价和改名建议，助您选择最适合的好名字。
                  </p>
                  <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>五行分析</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span>数理吉凶</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI智能解读</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 输入表单 - 宋代美学风格 */}
              <section className="mb-12">
                <Card className="max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                      姓名分析
                    </CardTitle>
                    <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-2"></div>
                    <CardDescription className="text-base font-serif text-slate-600 dark:text-slate-400">
                      请输入要分析的姓名，选择分析类型
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 基本信息 */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold font-serif text-slate-700 dark:text-slate-300">基本信息</h3>
                        
                        <div>
                          <Label htmlFor="name">姓名 *</Label>
                          <Input
                            id="name"
                            placeholder="请输入中文姓名（2-4个字）"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            maxLength={4}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            仅支持中文姓名，长度2-4个汉字
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="analysis-type">分析类型 *</Label>
                          <Select value={formData.analysis_type} onValueChange={(value: 'current' | 'suggestion') => setFormData({...formData, analysis_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="current">现有姓名分析</SelectItem>
                              <SelectItem value="suggestion">起名建议分析</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            选择是分析现有姓名还是起名参考
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold font-serif text-slate-700 dark:text-slate-300">生辰信息（可选）</h3>
                        <p className="text-sm font-serif text-slate-600 dark:text-slate-400">
                          填写生辰信息可获得更精准的五行配置分析
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <DateSelector
                            label="出生日期"
                            value={formData.birth_date}
                            onChange={(value) => setFormData({...formData, birth_date: value})}
                            placeholder="请选择出生日期"
                          />
                          <div>
                            <Label htmlFor="gender">性别</Label>
                            <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => setFormData({...formData, gender: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">男</SelectItem>
                                <SelectItem value="female">女</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <TimeSelector
                          label="出生时间"
                          value={formData.birth_time}
                          onChange={(value) => setFormData({...formData, birth_time: value})}
                          placeholder="请选择出生时间"
                        />

                        <CitySelector
                          label="出生城市"
                          value={formData.birth_city}
                          onChange={(value) => setFormData({...formData, birth_city: value})}
                          placeholder="请选择出生城市"
                        />
                      </div>
                    </div>

                    {/* 分析按钮 - 宋代美学风格 */}
                    <div className="text-center pt-4">
                      <Button 
                        onClick={handleAnalyze}
                        size="lg"
                        className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-serif px-12 shadow-lg"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span className="font-serif">分析中...</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-serif">开始分析 (消耗 120 天机点)</span>
                          </>
                        )}
                      </Button>
                      <p className="text-sm font-serif text-slate-600 dark:text-slate-400 mt-2">
                        姓名分析完成后将消耗 120 天机点
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
              <Card className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent"></div>
                      <User className="absolute inset-0 m-auto h-6 w-6 text-slate-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-semibold mb-2 text-slate-700 dark:text-slate-300">正在分析姓名...</h3>
                      <p className="text-base font-serif text-slate-600 dark:text-slate-400 mb-4">
                        AI正在分析姓名的五行配置、数理吉凶和音韵特点
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">五行分析</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">笔画计算</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">数理格局</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">音韵特点</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">AI智能解读</Badge>
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
                <h3 className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">姓名分析结果</h3>
                <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                <Button onClick={handleReset} variant="outline" className="font-serif border-slate-300 dark:border-slate-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  分析其他姓名
                </Button>
              </div>

              {/* 基本信息和综合评分 - 宋代美学风格 */}
              <Card className="mb-8 shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <CardHeader className="text-center">
                  <div className="text-sm font-serif text-slate-600 dark:text-slate-400">
                    {result.analysis_type === 'current' ? '现有姓名分析' : '起名建议分析'}
                  </div>
                  <CardTitle className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-200 mt-2">
                    {result.name}
                  </CardTitle>
                  <div className="text-lg font-serif text-slate-600 dark:text-slate-400 mt-2">
                    {result.basic_info.surname}（{result.basic_info.surname_strokes}画）+ {result.basic_info.given_name}（{result.basic_info.given_strokes}画）= 总计{result.basic_info.total_strokes}画
                  </div>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mt-4 mb-4"></div>
                  <div className="text-6xl font-serif font-bold mt-4">
                    <span className="text-slate-700 dark:text-slate-300 drop-shadow-sm">
                      {result.scores.overall_score}
                    </span>
                    <span className="text-2xl font-serif text-slate-500 dark:text-slate-400">分</span>
                  </div>
                  <Badge variant="secondary" className="mt-4 bg-slate-700 dark:bg-slate-600 text-white font-serif px-4 py-1">
                    综合评价
                  </Badge>
                </CardHeader>
              </Card>

              {/* 各项评分 - 宋代美学风格 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Object.entries(result.scores).filter(([key]) => key !== 'overall_score').map(([key, score]) => {
                  const labels = {
                    wuxing_score: '五行评分',
                    numerology_score: '数理评分',
                    phonetic_score: '音韵评分',
                    meaning_score: '寓意评分'
                  }
                  
                  return (
                    <Card key={key} className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">
                          {labels[key as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300 drop-shadow-sm">
                          {score}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* 五行分析 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-orange-600">五行配置分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="font-semibold text-sm mb-2">五行属性</div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">姓氏五行：</span>
                          <Badge className={getWuxingColor(result.wuxing_analysis.surname_wuxing)}>
                            {result.wuxing_analysis.surname_wuxing}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">名字五行：</span>
                          {result.wuxing_analysis.given_wuxing.map((wuxing, index) => (
                            <Badge key={index} className={getWuxingColor(wuxing)}>
                              {wuxing}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">整体五行：</span>
                          <Badge className={getWuxingColor(result.wuxing_analysis.overall_wuxing)}>
                            {result.wuxing_analysis.overall_wuxing}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-semibold text-sm mb-2">五行分布</div>
                      <div className="space-y-2">
                        {Object.entries(result.wuxing_analysis.wuxing_balance).map(([element, count]) => {
                          const elementNames = {
                            wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
                          }
                          return (
                            <div key={element} className="flex items-center justify-between">
                              <span className="text-sm">{elementNames[element as keyof typeof elementNames]}：</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-orange-500 h-2 rounded-full" 
                                    style={{width: `${Math.min(count * 20, 100)}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm w-6">{count}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-2">五行配合</div>
                    <Badge variant="outline" className="text-sm">
                      {result.wuxing_analysis.wuxing_compatibility}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 数理分析 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-blue-600">数理格局分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4">
                    {Object.entries(result.numerology).filter(([key]) => !key.includes('_fortune')).map(([key, value]) => {
                      const labels = {
                        tiange: '天格',
                        dige: '地格',
                        renge: '人格',
                        waige: '外格',
                        zongge: '总格'
                      }
                      const fortuneKey = `${key}_fortune` as keyof typeof result.numerology
                      const fortune = result.numerology[fortuneKey] as string
                      
                      return (
                        <div key={key} className="text-center">
                          <div className="font-semibold text-sm mb-2">{labels[key as keyof typeof labels]}</div>
                          <div className="text-2xl font-bold mb-2">{value}</div>
                          <Badge className={getFortuneColor(fortune)}>
                            {fortune}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 音韵特点 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-purple-600">音韵特点</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-sm mb-2">声调组合</div>
                        <div className="flex space-x-2">
                          {result.phonetics.tones.map((tone, index) => (
                            <Badge key={index} variant="outline">{tone}调</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-semibold text-sm mb-2">音调和谐度</div>
                        <Badge variant="secondary">{result.phonetics.tone_harmony}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-sm mb-2">发音难易度</div>
                        <Badge variant="secondary">{result.phonetics.pronunciation_difficulty}</Badge>
                      </div>
                      
                      <div>
                        <div className="font-semibold text-sm mb-2">韵律美感</div>
                        <Badge variant="secondary">{result.phonetics.rhyme_quality}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 寓意分析 */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">优势特点</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-semibold text-sm mb-2">积极寓意</div>
                      <ul className="space-y-1">
                        {result.meanings.positive_meanings.map((meaning, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            {meaning}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="font-semibold text-sm mb-2">姓名优势</div>
                      <ul className="space-y-1">
                        {result.suggestions.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">改进建议</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.meanings.potential_issues.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">注意事项</div>
                        <ul className="space-y-1">
                          {result.meanings.potential_issues.map((issue, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.suggestions.weaknesses.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">待改进方面</div>
                        <ul className="space-y-1">
                          {result.suggestions.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.suggestions.improvement_suggestions.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">改进建议</div>
                        <ul className="space-y-1">
                          {result.suggestions.improvement_suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 人生指导 */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-indigo-600">有利方位</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestions.lucky_directions.map((direction, index) => (
                        <Badge key={index} variant="outline">{direction}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-teal-600">适合职业</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestions.suitable_careers.map((career, index) => (
                        <Badge key={index} variant="outline">{career}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 文化内涵 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-amber-600">文化内涵</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.meanings.cultural_connotations.map((connotation, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                        <span className="text-sm">{connotation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* AI分析 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>AI专业分析</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {result.ai_analysis}
                  </div>
                </CardContent>
              </Card>

              {/* 操作按钮 - 宋代美学风格 */}
              <div className="text-center space-x-4">
                <Button onClick={handleReset} className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-serif">
                  <User className="h-4 w-4 mr-2" />
                  分析其他姓名
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                  <Star className="h-4 w-4 mr-2" />
                  保存到收藏
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                  分享结果
                </Button>
              </div>

              {/* 历史记录提示 - 宋代美学风格 */}
              <div className="mt-8">
                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-amber-800 dark:text-amber-200">
                        分析已保存
                      </h3>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300 font-serif mb-4">
                      本次姓名分析结果已自动保存到您的历史记录中，您可以随时查看和回顾所有分析结果。
                    </p>
                    <Link href="/history">
                      <Button variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-serif">
                        <BookOpen className="h-4 w-4 mr-2" />
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