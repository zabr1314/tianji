'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateSelector } from '@/components/ui/date-selector'
import { TimeSelector } from '@/components/ui/time-selector'
import { CitySelector } from '@/components/ui/city-selector'
import { Heart, ArrowLeft, Users, Sparkles, Calendar, User, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface PersonInfo {
  name: string
  birth_date: string
  birth_time: string
  birth_city: string
  gender: 'male' | 'female'
}

interface HepanData {
  person1: PersonInfo
  person2: PersonInfo
  relationship_type: 'couple' | 'friends' | 'colleagues' | 'family' | 'other'
}

interface HepanResult {
  success: boolean
  person1: {
    name: string
    bazi: any
    wuxing_analysis: any
  }
  person2: {
    name: string
    bazi: any
    wuxing_analysis: any
  }
  compatibility: {
    overall_score: number
    wuxing_compatibility: number
    ganzhi_compatibility: number
    yongshen_compatibility: number
    dayun_compatibility: number
  }
  analysis: {
    strengths: string[]
    challenges: string[]
    suggestions: string[]
  }
  detailed_scores: {
    love_score: number
    career_score: number
    wealth_score: number
    health_score: number
    family_score: number
  }
  ai_analysis: string
  cost: number
  error?: string
}

export default function HepanPage() {
  const [person1, setPerson1] = useState<PersonInfo>({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    gender: 'male'
  })

  const [person2, setPerson2] = useState<PersonInfo>({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_city: '',
    gender: 'female'
  })

  const [relationshipType, setRelationshipType] = useState<'couple' | 'friends' | 'colleagues' | 'family' | 'other'>('couple')

  const [result, setResult] = useState<HepanResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    if (!person1.name || !person1.birth_date || !person1.birth_time || !person1.birth_city) {
      setError('请填写完整的第一人信息')
      return false
    }
    if (!person2.name || !person2.birth_date || !person2.birth_time || !person2.birth_city) {
      setError('请填写完整的第二人信息')
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
      const response = await fetch('/api/hepan/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ person1, person2, relationship_type: relationshipType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '分析失败')
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
    setRelationshipType('couple')
    setPerson1({
      name: '',
      birth_date: '',
      birth_time: '',
      birth_city: '',
      gender: 'male'
    })
    setPerson2({
      name: '',
      birth_date: '',
      birth_time: '',
      birth_city: '',
      gender: 'female'
    })
  }

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
      background: `linear-gradient(45deg, 
        #fef7ed 0%, 
        #fef3e2 25%, 
        #fdf2f8 50%, 
        #fef7ed 75%, 
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
                    八字合盘分析
                  </h2>
                  <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                  <p className="text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                    通过分析两人的生辰八字，计算五行配置、干支相合、用神互补等多个维度，
                    为您提供全面的感情配对指导和相处建议。
                  </p>
                  <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>感情配对</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>性格互补</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI智能分析</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 输入表单 */}
              <section className="mb-12">
                {/* 关系类型选择 */}
                <Card className="mb-8 shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                      关系类型
                    </CardTitle>
                    <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-2"></div>
                    <CardDescription className="text-base font-serif text-slate-600 dark:text-slate-400">
                      请选择两人的关系类型，系统将据此调整分析重点
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <Label htmlFor="relationship-type">关系类型 *</Label>
                      <Select 
                        value={relationshipType} 
                        onValueChange={(value: 'couple' | 'friends' | 'colleagues' | 'family' | 'other') => setRelationshipType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="couple">💕 情侣关系</SelectItem>
                          <SelectItem value="friends">👫 朋友关系</SelectItem>
                          <SelectItem value="colleagues">🤝 合作伙伴</SelectItem>
                          <SelectItem value="family">👨‍👩‍👧‍👦 亲属关系</SelectItem>
                          <SelectItem value="other">🤔 其他关系</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* 第一人信息 - 宋代美学风格 */}
                  <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                        第一人信息
                      </CardTitle>
                      <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-2"></div>
                      <CardDescription className="text-base font-serif text-slate-600 dark:text-slate-400">
                        请填写第一人的详细出生信息
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="person1-name">姓名 *</Label>
                          <Input
                            id="person1-name"
                            placeholder="请输入姓名"
                            value={person1.name}
                            onChange={(e) => setPerson1({...person1, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="person1-gender">性别 *</Label>
                          <Select value={person1.gender} onValueChange={(value: 'male' | 'female') => setPerson1({...person1, gender: value})}>
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

                      <div>
                        <DateSelector
                          label="出生日期"
                          value={person1.birth_date}
                          onChange={(value) => setPerson1({...person1, birth_date: value})}
                          required
                        />
                      </div>

                      <div>
                        <TimeSelector
                          label="出生时间"
                          value={person1.birth_time}
                          onChange={(value) => setPerson1({...person1, birth_time: value})}
                          required
                        />
                      </div>

                      <div>
                        <CitySelector
                          label="出生城市"
                          value={person1.birth_city}
                          onChange={(value) => setPerson1({...person1, birth_city: value})}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 第二人信息 - 宋代美学风格 */}
                  <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                        第二人信息
                      </CardTitle>
                      <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-2"></div>
                      <CardDescription className="text-base font-serif text-slate-600 dark:text-slate-400">
                        请填写第二人的详细出生信息
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="person2-name">姓名 *</Label>
                          <Input
                            id="person2-name"
                            placeholder="请输入姓名"
                            value={person2.name}
                            onChange={(e) => setPerson2({...person2, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="person2-gender">性别 *</Label>
                          <Select value={person2.gender} onValueChange={(value: 'male' | 'female') => setPerson2({...person2, gender: value})}>
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

                      <div>
                        <DateSelector
                          label="出生日期"
                          value={person2.birth_date}
                          onChange={(value) => setPerson2({...person2, birth_date: value})}
                          required
                        />
                      </div>

                      <div>
                        <TimeSelector
                          label="出生时间"
                          value={person2.birth_time}
                          onChange={(value) => setPerson2({...person2, birth_time: value})}
                          required
                        />
                      </div>

                      <div>
                        <CitySelector
                          label="出生城市"
                          value={person2.birth_city}
                          onChange={(value) => setPerson2({...person2, birth_city: value})}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 分析按钮 */}
                <div className="text-center mt-8">
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
                        <Heart className="w-4 h-4 mr-2" />
                        <span className="font-serif">开始合盘分析 (消耗 300 天机点)</span>
                      </>
                    )}
                  </Button>
                  <p className="text-sm font-serif text-slate-600 dark:text-slate-400 mt-2">
                    分析完成后将消耗 300 天机点
                  </p>
                </div>
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
                      <Heart className="absolute inset-0 m-auto h-6 w-6 text-slate-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-semibold mb-2 text-slate-700 dark:text-slate-300">正在进行合盘分析...</h3>
                      <p className="text-base font-serif text-slate-600 dark:text-slate-400 mb-4">
                        AI正在分析两人的八字配对，计算五行互补和干支相合度
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">排列双方八字</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">分析五行配置</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">计算干支相合</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">判断用神配对</Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-serif">推算大运相合</Badge>
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

          {/* 分析结果 */}
          {result && (
            <section>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">合盘分析结果</h3>
                <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                <Button onClick={handleReset} variant="outline" className="font-serif border-slate-300 dark:border-slate-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
              </div>

              {/* 综合评分 - 宋代美学风格 */}
              <Card className="mb-8 shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
                    综合匹配度
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
                  <div className="text-6xl font-serif font-bold mt-4">
                    <span className={`${getScoreColor(result.compatibility.overall_score)} drop-shadow-sm`}>
                      {result.compatibility.overall_score}
                    </span>
                    <span className="text-2xl font-serif text-slate-500 dark:text-slate-400">分</span>
                  </div>
                  <Badge variant="secondary" className="mt-4 bg-slate-700 dark:bg-slate-600 text-white font-serif px-4 py-1">
                    {getScoreLabel(result.compatibility.overall_score)}
                  </Badge>
                </CardHeader>
              </Card>

              {/* 详细评分 - 宋代美学风格 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">感情和谐</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-2xl font-serif font-bold ${getScoreColor(result.detailed_scores.love_score)} drop-shadow-sm`}>
                      {result.detailed_scores.love_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">事业配合</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-2xl font-serif font-bold ${getScoreColor(result.detailed_scores.career_score)} drop-shadow-sm`}>
                      {result.detailed_scores.career_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">财运互补</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-2xl font-serif font-bold ${getScoreColor(result.detailed_scores.wealth_score)} drop-shadow-sm`}>
                      {result.detailed_scores.wealth_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">健康相助</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-2xl font-serif font-bold ${getScoreColor(result.detailed_scores.health_score)} drop-shadow-sm`}>
                      {result.detailed_scores.health_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">家庭和睦</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-2xl font-serif font-bold ${getScoreColor(result.detailed_scores.family_score)} drop-shadow-sm`}>
                      {result.detailed_scores.family_score}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI分析 - 宋代美学风格 */}
              <Card className="mb-8 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-3 text-xl font-serif font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">智</span>
                    </div>
                    <div>AI智能分析</div>
                  </CardTitle>
                  <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mt-4"></div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <div className="whitespace-pre-line text-base font-serif leading-relaxed text-slate-700 dark:text-slate-300">
                      {result.ai_analysis}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 基础分析 - 宋代美学风格 */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-serif font-bold text-amber-700 dark:text-amber-400 mb-2">优势方面</CardTitle>
                    <div className="w-12 h-px bg-amber-300 dark:bg-amber-600 mx-auto"></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-serif font-bold text-amber-700 dark:text-amber-400 mb-2">挑战方面</CardTitle>
                    <div className="w-12 h-px bg-amber-300 dark:bg-amber-600 mx-auto"></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.analysis.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-serif font-bold text-slate-700 dark:text-slate-400 mb-2">改善建议</CardTitle>
                    <div className="w-12 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-slate-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* 操作按钮 - 宋代美学风格 */}
              <div className="text-center space-x-4">
                <Button onClick={handleReset} className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-serif">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                  <Calendar className="h-4 w-4 mr-2" />
                  保存报告
                </Button>
                <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                  分享结果
                </Button>
              </div>

              {/* 历史记录提示 */}
              <div className="mt-8">
                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
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