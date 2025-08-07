'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Moon, Sparkles, RefreshCw, Brain, Heart, Star, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react'
import { DreamCategory, DreamMood } from '@/lib/dream/calculator'

interface DreamInterpretationResult {
  success: boolean
  dream_input: {
    content: string
    category: string
    mood: string
    dreamer_info?: any
  }
  analysis: {
    dream_summary: string
    category_analysis: {
      primary_category: string
      secondary_categories: string[]
      symbolic_elements: string[]
    }
    psychological_analysis: {
      subconscious_themes: string[]
      emotional_state: string
      potential_triggers: string[]
      stress_indicators: string[]
    }
    symbolic_interpretation: {
      key_symbols: Array<{
        symbol: string
        traditional_meaning: string
        psychological_meaning: string
        personal_relevance: string
      }>
    }
    life_guidance: {
      current_situation_insights: string[]
      emotional_needs: string[]
      growth_opportunities: string[]
      recommended_actions: string[]
    }
    dream_quality: {
      clarity_score: number
      emotional_intensity: number
      symbolic_richness: number
      overall_significance: number
    }
    warnings_and_suggestions: {
      health_reminders: string[]
      relationship_insights: string[]
      career_guidance: string[]
      spiritual_messages: string[]
    }
  }
  ai_interpretation: string
  cost: number
  error?: string
}

export default function DreamInterpretationPage() {
  const [formData, setFormData] = useState({
    dream_content: '',
    dream_category: '' as DreamCategory,
    dream_mood: '' as DreamMood,
    dream_frequency: 'occasional' as 'rare' | 'occasional' | 'frequent',
    lucid_dream: false,
    dreamer_info: {
      age_range: '' as '18-25' | '26-35' | '36-45' | '46-55' | '55+' | '',
      gender: '' as 'male' | 'female' | '',
      life_stage: '' as 'student' | 'working' | 'married' | 'retired' | '',
      recent_stress: false
    }
  })

  const [result, setResult] = useState<DreamInterpretationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const { dream_content, dream_category, dream_mood } = formData
    if (!dream_content) {
      setError('请输入梦境内容描述')
      return false
    }
    if (dream_content.length < 10) {
      setError('梦境描述过于简短，请详细描述您的梦境')
      return false
    }
    if (!dream_category) {
      setError('请选择梦境主要分类')
      return false
    }
    if (!dream_mood) {
      setError('请选择梦境中的情绪')
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
        ...formData,
        dreamer_info: {
          ...formData.dreamer_info,
          age_range: formData.dreamer_info.age_range || undefined,
          gender: formData.dreamer_info.gender || undefined,
          life_stage: formData.dreamer_info.life_stage || undefined
        }
      }

      const response = await fetch('/api/dream/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '梦境解析失败')
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

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityLabel = (score: number) => {
    if (score >= 8) return '很高'
    if (score >= 6) return '较高'
    if (score >= 4) return '中等'
    return '一般'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {!result && !isAnalyzing && (
            <>
              {/* 页面介绍 */}
              <section className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI智能解梦
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                  结合传统解梦智慧与现代心理学理论，运用人工智能技术深度解读您的梦境。
                  帮您理解潜意识信息，获得心理健康指导和人生启示。
                </p>
                <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>梦境分析</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>心理解读</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI智能分析</span>
                  </div>
                </div>
              </section>

              {/* 输入表单 */}
              <section className="mb-12">
                <Card className="max-w-4xl mx-auto shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Moon className="h-5 w-5 text-indigo-600" />
                      <span>梦境解析</span>
                    </CardTitle>
                    <CardDescription>
                      请详细描述您的梦境，选择相关分类和情绪
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 梦境描述 */}
                    <div>
                      <Label htmlFor="dream-content">梦境内容 *</Label>
                      <Textarea
                        id="dream-content"
                        placeholder="请详细描述您的梦境，包括梦中的人物、场景、情节、感受等..."
                        value={formData.dream_content}
                        onChange={(e) => setFormData({...formData, dream_content: e.target.value})}
                        rows={6}
                        maxLength={2000}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>请详细描述，有助于更准确的解析</span>
                        <span>{formData.dream_content.length}/2000</span>
                      </div>
                    </div>

                    {/* 梦境分类和情绪 */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">梦境特征</h3>
                        
                        <div>
                          <Label htmlFor="dream-category">梦境分类 *</Label>
                          <Select value={formData.dream_category} onValueChange={(value: DreamCategory) => setFormData({...formData, dream_category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择梦境主要分类" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={DreamCategory.PEOPLE}>人物</SelectItem>
                              <SelectItem value={DreamCategory.ANIMALS}>动物</SelectItem>
                              <SelectItem value={DreamCategory.OBJECTS}>物品</SelectItem>
                              <SelectItem value={DreamCategory.NATURE}>自然</SelectItem>
                              <SelectItem value={DreamCategory.EMOTIONS}>情感</SelectItem>
                              <SelectItem value={DreamCategory.ACTIONS}>行为</SelectItem>
                              <SelectItem value={DreamCategory.PLACES}>场所</SelectItem>
                              <SelectItem value={DreamCategory.SUPERNATURAL}>超自然</SelectItem>
                              <SelectItem value={DreamCategory.WORK_STUDY}>工作学习</SelectItem>
                              <SelectItem value={DreamCategory.OTHER}>其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dream-mood">梦境情绪 *</Label>
                          <Select value={formData.dream_mood} onValueChange={(value: DreamMood) => setFormData({...formData, dream_mood: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择梦境中的主要情绪" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={DreamMood.HAPPY}>愉快</SelectItem>
                              <SelectItem value={DreamMood.ANXIOUS}>焦虑</SelectItem>
                              <SelectItem value={DreamMood.FEARFUL}>恐惧</SelectItem>
                              <SelectItem value={DreamMood.CONFUSED}>困惑</SelectItem>
                              <SelectItem value={DreamMood.PEACEFUL}>平静</SelectItem>
                              <SelectItem value={DreamMood.EXCITED}>兴奋</SelectItem>
                              <SelectItem value={DreamMood.SAD}>悲伤</SelectItem>
                              <SelectItem value={DreamMood.ANGRY}>愤怒</SelectItem>
                              <SelectItem value={DreamMood.NEUTRAL}>中性</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dream-frequency">做梦频率</Label>
                          <Select value={formData.dream_frequency} onValueChange={(value: 'rare' | 'occasional' | 'frequent') => setFormData({...formData, dream_frequency: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rare">很少做梦</SelectItem>
                              <SelectItem value="occasional">偶尔做梦</SelectItem>
                              <SelectItem value="frequent">经常做梦</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lucid-dream"
                            checked={formData.lucid_dream}
                            onChange={(e) => setFormData({...formData, lucid_dream: e.target.checked})}
                            className="rounded"
                          />
                          <Label htmlFor="lucid-dream" className="text-sm">这是清醒梦（知道自己在做梦）</Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">个人信息（可选）</h3>
                        <p className="text-sm text-muted-foreground">
                          提供个人信息有助于更准确的解梦分析
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="age-range">年龄段</Label>
                            <Select value={formData.dreamer_info.age_range} onValueChange={(value: '18-25' | '26-35' | '36-45' | '46-55' | '55+') => setFormData({...formData, dreamer_info: {...formData.dreamer_info, age_range: value}})}>
                              <SelectTrigger>
                                <SelectValue placeholder="选择年龄段" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="18-25">18-25岁</SelectItem>
                                <SelectItem value="26-35">26-35岁</SelectItem>
                                <SelectItem value="36-45">36-45岁</SelectItem>
                                <SelectItem value="46-55">46-55岁</SelectItem>
                                <SelectItem value="55+">55岁以上</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="gender">性别</Label>
                            <Select value={formData.dreamer_info.gender} onValueChange={(value: 'male' | 'female') => setFormData({...formData, dreamer_info: {...formData.dreamer_info, gender: value}})}>
                              <SelectTrigger>
                                <SelectValue placeholder="选择性别" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">男</SelectItem>
                                <SelectItem value="female">女</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="life-stage">人生阶段</Label>
                          <Select value={formData.dreamer_info.life_stage} onValueChange={(value: 'student' | 'working' | 'married' | 'retired') => setFormData({...formData, dreamer_info: {...formData.dreamer_info, life_stage: value}})}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择人生阶段" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">学生时期</SelectItem>
                              <SelectItem value="working">工作期间</SelectItem>
                              <SelectItem value="married">已婚家庭</SelectItem>
                              <SelectItem value="retired">退休阶段</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="recent-stress"
                            checked={formData.dreamer_info.recent_stress}
                            onChange={(e) => setFormData({...formData, dreamer_info: {...formData.dreamer_info, recent_stress: e.target.checked}})}
                            className="rounded"
                          />
                          <Label htmlFor="recent-stress" className="text-sm">最近生活压力较大</Label>
                        </div>
                      </div>
                    </div>

                    {/* 分析按钮 */}
                    <div className="text-center pt-4">
                      <Button 
                        onClick={handleAnalyze}
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-12"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            解析中...
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 mr-2" />
                            开始解梦 (消耗 80 天机点)
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        梦境解析完成后将消耗 80 天机点
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* 分析中状态 */}
          {isAnalyzing && (
            <section className="text-center py-16">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
                      <Moon className="absolute inset-0 m-auto h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">正在解析梦境...</h3>
                      <p className="text-muted-foreground mb-4">
                        AI正在结合心理学理论和传统解梦智慧，深度分析您的梦境
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary">梦境分类</Badge>
                        <Badge variant="secondary">心理分析</Badge>
                        <Badge variant="secondary">象征解读</Badge>
                        <Badge variant="secondary">生活指导</Badge>
                        <Badge variant="secondary">AI深度解释</Badge>
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
                    重新解析
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 解析结果 */}
          {result && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">梦境解析结果</h3>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  解析其他梦境
                </Button>
              </div>

              {/* 梦境摘要 */}
              <Card className="mb-8 shadow-lg">
                <CardHeader className="text-center">
                  <div className="text-sm text-muted-foreground">
                    {result.dream_input.category} • {result.dream_input.mood}情绪
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    梦境解析报告
                  </CardTitle>
                  <div className="text-base text-muted-foreground max-w-3xl mx-auto">
                    {result.analysis.dream_summary}
                  </div>
                </CardHeader>
              </Card>

              {/* 梦境质量评估 */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {Object.entries(result.analysis.dream_quality).map(([key, score]) => {
                  const labels = {
                    clarity_score: '清晰度',
                    emotional_intensity: '情感强度',
                    symbolic_richness: '象征丰富度',
                    overall_significance: '整体重要性'
                  }
                  
                  return (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{labels[key as keyof typeof labels]}</span>
                          <TrendingUp className="h-4 w-4" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getQualityColor(score)}`}>
                          {score}/10
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getQualityLabel(score)}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* 分类和象征分析 */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">梦境分析</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-semibold text-sm mb-2">主要分类</div>
                      <Badge variant="outline" className="mb-2">
                        {result.analysis.category_analysis.primary_category}
                      </Badge>
                    </div>
                    
                    {result.analysis.category_analysis.secondary_categories.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">次要分类</div>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.category_analysis.secondary_categories.map((category, index) => (
                            <Badge key={index} variant="secondary">{category}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.analysis.category_analysis.symbolic_elements.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">象征元素</div>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.category_analysis.symbolic_elements.map((element, index) => (
                            <Badge key={index} variant="outline">{element}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-purple-600">心理状态</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-semibold text-sm mb-2">情绪状态</div>
                      <p className="text-sm text-muted-foreground">
                        {result.analysis.psychological_analysis.emotional_state}
                      </p>
                    </div>
                    
                    {result.analysis.psychological_analysis.subconscious_themes.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">潜意识主题</div>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.psychological_analysis.subconscious_themes.map((theme, index) => (
                            <Badge key={index} variant="secondary">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.analysis.psychological_analysis.stress_indicators.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">压力指标</div>
                        <ul className="space-y-1">
                          {result.analysis.psychological_analysis.stress_indicators.map((indicator, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <AlertCircle className="w-3 h-3 text-orange-500 mr-2" />
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 象征解释 */}
              {result.analysis.symbolic_interpretation.key_symbols.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-green-600">象征符号解读</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.analysis.symbolic_interpretation.key_symbols.map((symbol, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="font-semibold text-lg mb-2 flex items-center">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            {symbol.symbol}
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-blue-600 mb-1">传统含义</div>
                              <p className="text-muted-foreground">{symbol.traditional_meaning}</p>
                            </div>
                            <div>
                              <div className="font-medium text-purple-600 mb-1">心理学含义</div>
                              <p className="text-muted-foreground">{symbol.psychological_meaning}</p>
                            </div>
                            <div>
                              <div className="font-medium text-green-600 mb-1">个人相关性</div>
                              <p className="text-muted-foreground">{symbol.personal_relevance}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 生活指导 */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-teal-600">生活洞察</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.analysis.life_guidance.current_situation_insights.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">当前状况</div>
                        <ul className="space-y-1">
                          {result.analysis.life_guidance.current_situation_insights.map((insight, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.analysis.life_guidance.emotional_needs.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">情感需求</div>
                        <ul className="space-y-1">
                          {result.analysis.life_guidance.emotional_needs.map((need, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <Heart className="w-3 h-3 text-pink-500 mr-2" />
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">成长建议</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.analysis.life_guidance.growth_opportunities.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">成长机会</div>
                        <ul className="space-y-1">
                          {result.analysis.life_guidance.growth_opportunities.map((opportunity, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <TrendingUp className="w-3 h-3 text-green-500 mr-2" />
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.analysis.life_guidance.recommended_actions.length > 0 && (
                      <div>
                        <div className="font-semibold text-sm mb-2">建议行动</div>
                        <ul className="space-y-1">
                          {result.analysis.life_guidance.recommended_actions.map((action, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <Lightbulb className="w-3 h-3 text-yellow-500 mr-2" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 警示和建议 */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">健康提醒</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.analysis.warnings_and_suggestions.health_reminders.map((reminder, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <AlertCircle className="w-3 h-3 text-red-500 mr-2" />
                          {reminder}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">精神启示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.analysis.warnings_and_suggestions.spiritual_messages.map((message, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Star className="w-3 h-3 text-blue-500 mr-2" />
                          {message}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* AI深度解读 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>AI专业解读</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {result.ai_interpretation}
                  </div>
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              <div className="text-center space-x-4">
                <Button onClick={handleReset}>
                  <Moon className="h-4 w-4 mr-2" />
                  解析其他梦境
                </Button>
                <Button variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  保存到收藏
                </Button>
                <Button variant="outline">
                  分享解析结果
                </Button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 天机AI. 解读梦境，洞察心灵</p>
          </div>
        </div>
      </footer>
    </div>
  )
}