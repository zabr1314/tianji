'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Moon, Sparkles, RefreshCw, Brain, Heart, Star, TrendingUp, AlertCircle, Lightbulb, Download, Share2, Copy, Check } from 'lucide-react'
import { DreamCategory, DreamMood } from '@/lib/dream/calculator'
import { LightweightMarkdown } from '@/components/ui/lightweight-markdown'
import { apiCall, handleApiError } from '@/lib/utils/api-client'

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
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [showShareImage, setShowShareImage] = useState(false)

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

      const data = await apiCall('/api/dream/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      setResult(data as DreamInterpretationResult)
    } catch (error) {
      handleApiError(error, '梦境解析失败，请稍后重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setShareImageUrl(null)
    setShowShareImage(false)
  }

  // 保存报告功能
  const handleSaveReport = async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      // 生成PDF报告内容
      const reportContent = generateDreamReportContent(result)
      
      // 创建并下载文件
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `梦境解析报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`
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

  // 分享梦境解析结果
  const handleShareResult = async () => {
    if (!result) return
    
    setIsSharing(true)
    try {
      // 生成分享图片
      const shareImageBlob = await generateDreamShareImage(result)
      
      if (shareImageBlob) {
        // 创建图片URL用于页面显示
        const imageUrl = URL.createObjectURL(shareImageBlob)
        setShareImageUrl(imageUrl)
        setShowShareImage(true)
      } else {
        // 降级方案：文本分享
        const shareText = `🌙 我在天机AI完成了梦境解析！
✨ 梦境分类：${result.dream_input.category}
💭 情绪状态：${result.dream_input.mood}
🔮 AI为我揭示了深层的心理状态和人生指引
🌟 来体验专业的梦境解析吧！
#天机AI #梦境解析 #AI解梦`
        
        if (navigator.share) {
          await navigator.share({
            title: '我的梦境解析报告',
            text: shareText,
            url: window.location.href
          })
        } else {
          await navigator.clipboard.writeText(shareText)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    } catch (error) {
      console.error('分享失败:', error)
      try {
        const shareText = `天机AI - 梦境解析报告\n\n梦境分类：${result.dream_input.category}\n情绪状态：${result.dream_input.mood}\n\n查看详情：${window.location.href}`
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (clipboardError) {
        alert('分享失败，请稍后重试')
      }
    } finally {
      setIsSharing(false)
    }
  }

  // 关闭分享图片显示
  const handleCloseShareImage = () => {
    setShowShareImage(false)
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl)
      setShareImageUrl(null)
    }
  }

  // 下载分享图片
  const handleDownloadShareImage = () => {
    if (!shareImageUrl) return
    
    const a = document.createElement('a')
    a.href = shareImageUrl
    a.download = `梦境解析分享_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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

  // 生成梦境解析报告内容
  const generateDreamReportContent = (data: DreamInterpretationResult): string => {
    const date = new Date().toLocaleDateString('zh-CN')
    return `
==============================
          梦境解析报告
==============================

生成时间：${date}
梦境分类：${data.dream_input.category}
情绪状态：${data.dream_input.mood}

==============================
           梦境摘要
==============================
${data.analysis.dream_summary}

==============================
          梦境质量评估
==============================
清晰度：${data.analysis.dream_quality.clarity_score}/10 (${getQualityLabel(data.analysis.dream_quality.clarity_score)})
情感强度：${data.analysis.dream_quality.emotional_intensity}/10 (${getQualityLabel(data.analysis.dream_quality.emotional_intensity)})
象征丰富度：${data.analysis.dream_quality.symbolic_richness}/10 (${getQualityLabel(data.analysis.dream_quality.symbolic_richness)})
整体重要性：${data.analysis.dream_quality.overall_significance}/10 (${getQualityLabel(data.analysis.dream_quality.overall_significance)})

==============================
           心理状态分析
==============================
情绪状态：${data.analysis.psychological_analysis.emotional_state}

潜意识主题：
${data.analysis.psychological_analysis.subconscious_themes.map(theme => `• ${theme}`).join('\n')}

压力指标：
${data.analysis.psychological_analysis.stress_indicators.map(indicator => `• ${indicator}`).join('\n')}

==============================
           象征解读
==============================
${data.analysis.symbolic_interpretation.key_symbols.map(symbol => `
【${symbol.symbol}】
传统含义：${symbol.traditional_meaning}
心理学含义：${symbol.psychological_meaning}
个人相关性：${symbol.personal_relevance}
`).join('\n')}

==============================
           生活指导
==============================
当前状况洞察：
${data.analysis.life_guidance.current_situation_insights.map(insight => `• ${insight}`).join('\n')}

情感需求：
${data.analysis.life_guidance.emotional_needs.map(need => `• ${need}`).join('\n')}

成长机会：
${data.analysis.life_guidance.growth_opportunities.map(opportunity => `• ${opportunity}`).join('\n')}

建议行动：
${data.analysis.life_guidance.recommended_actions.map(action => `• ${action}`).join('\n')}

==============================
           警示与建议
==============================
健康提醒：
${data.analysis.warnings_and_suggestions.health_reminders.map(reminder => `• ${reminder}`).join('\n')}

精神启示：
${data.analysis.warnings_and_suggestions.spiritual_messages.map(message => `• ${message}`).join('\n')}

==============================
          AI深度解读
==============================
${data.ai_interpretation}

==============================
本次分析消耗：${data.cost} 天机点
报告由天机AI生成 - 仅供参考
==============================`
  }

  // 生成分享图片
  const generateDreamShareImage = async (data: DreamInterpretationResult): Promise<Blob | null> => {
    try {
      // 动态导入html2canvas
      const html2canvas = await import('html2canvas').then(module => module.default)
      
      // 创建分享内容元素
      const shareElement = document.createElement('div')
      shareElement.style.cssText = `
        width: 450px;
        height: 800px;
        background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 50%, #fdba74 100%);
        font-family: serif;
        position: fixed;
        top: -9999px;
        left: -9999px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      `
      
      // 提取关键解析内容
      const keyInsights = extractDreamKeyContent(data)
      
      shareElement.innerHTML = `
        <div style="padding: 32px 24px; height: 100%; display: flex; flex-direction: column; color: #8b4513;">
          <!-- 标题区域 -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background: #dc2626; color: white; display: inline-block; padding: 12px 20px; border-radius: 8px; font-size: 20px; font-weight: bold; margin-bottom: 8px;">
              我的梦境解析报告
            </div>
            <div style="font-size: 14px; color: #a16207;">天机AI · 个性解读</div>
          </div>
          
          <!-- 梦境特征 -->
          <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 2px solid #f59e0b;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 16px;">🌙</span>
              <span style="font-weight: bold; margin-left: 8px; font-size: 14px;">梦境特征</span>
            </div>
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="margin-bottom: 4px;"><strong>分类：</strong>${data.dream_input.category}</div>
              <div style="margin-bottom: 4px;"><strong>情绪：</strong>${data.dream_input.mood}</div>
              <div><strong>整体重要性：</strong>${data.analysis.dream_quality.overall_significance}/10</div>
            </div>
          </div>
          
          <!-- 心理解读 -->
          <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 2px solid #f59e0b;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 16px;">🧠</span>
              <span style="font-weight: bold; margin-left: 8px; font-size: 14px;">心理解读</span>
            </div>
            <div style="font-size: 11px; line-height: 1.5; color: #7c2d12;">
              ${keyInsights.psychology}
            </div>
          </div>
          
          <!-- 生活指导 -->
          <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 2px solid #f59e0b; flex: 1;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 16px;">✨</span>
              <span style="font-weight: bold; margin-left: 8px; font-size: 14px;">生活指导</span>
            </div>
            <div style="font-size: 11px; line-height: 1.5; color: #7c2d12;">
              ${keyInsights.guidance}
            </div>
          </div>
          
          <!-- 底部装饰 -->
          <div style="text-align: center; padding-top: 16px; border-top: 2px solid #f59e0b;">
            <div style="font-size: 12px; color: #a16207; font-weight: bold;">扫码体验专业的AI梦境解析</div>
          </div>
        </div>
      `
      
      document.body.appendChild(shareElement)
      
      // 使用html2canvas生成图片
      const canvas = await html2canvas(shareElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fef7ed',
        width: 450,
        height: 800,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 450,
        windowHeight: 800
      })
      
      document.body.removeChild(shareElement)
      
      // 转换为Blob
      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
    } catch (error) {
      console.error('生成分享图片失败:', error)
      return null
    }
  }

  // 提取梦境关键解析内容
  const extractDreamKeyContent = (data: DreamInterpretationResult) => {
    // 提取心理解读关键内容
    const psychology = data.analysis.psychological_analysis.emotional_state.length > 60 
      ? data.analysis.psychological_analysis.emotional_state.substring(0, 60) + '...' 
      : data.analysis.psychological_analysis.emotional_state
    
    // 提取生活指导关键内容
    const topGuidance = data.analysis.life_guidance.current_situation_insights.slice(0, 2)
    const guidance = topGuidance.length > 0 
      ? topGuidance.join('；').length > 80 
        ? topGuidance.join('；').substring(0, 80) + '...'
        : topGuidance.join('；')
      : '暂无指导内容'
    
    return {
      psychology,
      guidance
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <div className="relative z-10">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {!result && !isAnalyzing && (
            <>
              {/* 页面标题 - 简洁设计 */}
              <section className="text-center mb-12">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-5xl font-serif font-bold text-red-700 dark:text-red-400 mb-6">
                    梦境解析
                  </h1>
                  
                  <p className="text-xl font-serif text-amber-700 dark:text-amber-300 mb-8">
                    运用AI智慧，解读梦境奥秘，洞察内心世界
                  </p>
                  
                  {/* 功能特色 - 简化版 */}
                  <div className="flex justify-center items-center space-x-12 text-amber-600 dark:text-amber-400">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-5 w-5" />
                      <span className="font-serif">梦境分析</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span className="font-serif">心理解读</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-serif">AI智慧</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 输入表单 - 宋代美学风格 */}
              <section className="mb-16">
                <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 backdrop-blur-sm">
                  <CardHeader className="text-center relative">
                    {/* 传统云纹装饰 */}
                    <div className="absolute top-4 left-4 w-8 h-8 opacity-20">
                      <svg viewBox="0 0 32 32" className="w-full h-full text-amber-400">
                        <path d="M8,16 Q4,8 8,4 Q12,0 16,4 Q20,0 24,4 Q28,8 24,16 Q28,24 24,28 Q20,32 16,28 Q12,32 8,28 Q4,24 8,16 Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="absolute top-4 right-4 w-8 h-8 opacity-20">
                      <svg viewBox="0 0 32 32" className="w-full h-full text-amber-400">
                        <path d="M8,16 Q4,8 8,4 Q12,0 16,4 Q20,0 24,4 Q28,8 24,16 Q28,24 24,28 Q20,32 16,28 Q12,32 8,28 Q4,24 8,16 Z" fill="currentColor"/>
                      </svg>
                    </div>
                    
                    <CardTitle className="text-3xl font-serif font-bold text-amber-800 dark:text-amber-200 mb-4">
                      梦境录入
                    </CardTitle>
                    
                    {/* 古典装饰线 */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-px bg-amber-400 dark:bg-amber-600"></div>
                      <div className="mx-3 w-2 h-2 bg-amber-400 dark:bg-amber-600 rounded-full"></div>
                      <div className="w-16 h-px bg-amber-400 dark:bg-amber-600"></div>
                    </div>
                    
                    <CardDescription className="text-lg font-serif text-amber-700 dark:text-amber-300 leading-relaxed">
                      请详述梦境内容，选择分类情绪，以助AI深度解析
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

                    {/* 分析按钮 - 古典风格 */}
                    <div className="text-center pt-6">
                      <div className="relative inline-block">
                        {/* 按钮装饰边框 */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-lg opacity-20 blur-sm"></div>
                        <Button 
                          onClick={handleAnalyze}
                          size="lg"
                          className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-serif px-16 py-4 text-lg shadow-xl border-2 border-amber-300 dark:border-amber-500"
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              <span className="font-serif tracking-wide">解析梦境中...</span>
                            </>
                          ) : (
                            <>
                              <Moon className="w-5 h-5 mr-3" />
                              <span className="font-serif tracking-wide">开始解梦</span>
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* 费用说明 - 古典样式 */}
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-800 rounded-full border border-amber-300 dark:border-amber-600">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                          <span className="text-sm font-serif text-amber-700 dark:text-amber-300">
                            消耗 80 天机点
                          </span>
                          <div className="w-2 h-2 bg-amber-500 rounded-full ml-2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* 分析中状态 */}
          {isAnalyzing && (
            <section className="text-center py-16">
              <Card className="max-w-2xl mx-auto border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
                      <Moon className="absolute inset-0 m-auto h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-semibold mb-2 text-slate-700 dark:text-slate-300">正在解析梦境...</h3>
                      <p className="text-base font-serif text-slate-600 dark:text-slate-400 mb-4">
                        AI正在结合心理学理论和传统解梦智慧，深度分析您的梦境
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-serif">梦境分类</Badge>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-serif">心理分析</Badge>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-serif">象征解读</Badge>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-serif">生活指导</Badge>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-serif">AI深度解释</Badge>
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
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-bold text-purple-700 dark:text-purple-300 mb-4">梦境解析结果</h3>
                <div className="w-24 h-px bg-purple-300 dark:bg-purple-600 mx-auto mb-6"></div>
                <Button onClick={handleReset} variant="outline" className="font-serif border-purple-300 dark:border-purple-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  解析其他梦境
                </Button>
              </div>

              {/* 梦境摘要 - 宋代美学风格 */}
              <Card className="mb-12 shadow-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
                <CardHeader className="text-center relative pb-8">
                  {/* 背景装饰 */}
                  <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      <circle cx="100" cy="50" r="30" fill="currentColor" className="text-amber-400"/>
                      <circle cx="300" cy="150" r="20" fill="currentColor" className="text-orange-400"/>
                      <path d="M50,100 Q100,80 150,100 T250,100" stroke="currentColor" strokeWidth="2" fill="none" className="text-red-400"/>
                    </svg>
                  </div>
                  
                  {/* 分类标签 */}
                  <div className="relative z-10 mb-6">
                    <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-800 rounded-full border border-amber-300 dark:border-amber-600">
                      <span className="text-sm font-serif text-amber-700 dark:text-amber-300">
                        {result.dream_input.category} • {result.dream_input.mood}情绪
                      </span>
                    </div>
                  </div>
                  
                  {/* 装饰线 */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-px bg-amber-400 dark:bg-amber-600"></div>
                    <div className="mx-4 w-3 h-3 border-2 border-amber-400 dark:border-amber-600 rounded-full bg-amber-100 dark:bg-amber-800"></div>
                    <div className="w-16 h-px bg-amber-400 dark:bg-amber-600"></div>
                  </div>
                  
                  {/* 传统印章式标题 */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-red-600 dark:bg-red-700 transform rotate-45 rounded-lg opacity-15"></div>
                    <CardTitle className="relative text-4xl font-serif font-bold text-red-700 dark:text-red-400 px-8 py-4 tracking-wider">
                      梦境解析报告
                    </CardTitle>
                  </div>
                  
                  {/* 摘要内容 */}
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg p-6 border border-amber-200 dark:border-amber-700 shadow-lg max-w-4xl mx-auto">
                    <p className="text-lg font-serif leading-relaxed text-slate-700 dark:text-slate-300 text-justify">
                      {result.analysis.dream_summary}
                    </p>
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
                    <Card key={key} className="border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-sm font-serif font-semibold text-purple-700 dark:text-purple-300">
                          {labels[key as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className={`text-2xl font-serif font-bold ${getQualityColor(score)} drop-shadow-sm`}>
                          {score}/10
                        </div>
                        <div className="text-xs font-serif text-purple-600 dark:text-purple-400">
                          {getQualityLabel(score)}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* 分类和象征分析 */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-serif font-bold text-purple-700 dark:text-purple-300">梦境分析</CardTitle>
                    <div className="w-12 h-px bg-purple-300 dark:bg-purple-600 mx-auto mt-2"></div>
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

                <Card className="border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-serif font-bold text-purple-700 dark:text-purple-300">心理状态</CardTitle>
                    <div className="w-12 h-px bg-purple-300 dark:bg-purple-600 mx-auto mt-2"></div>
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
                <Card className="mb-8 border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-serif font-bold text-purple-700 dark:text-purple-300">象征符号解读</CardTitle>
                    <div className="w-16 h-px bg-purple-300 dark:bg-purple-600 mx-auto mt-2"></div>
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

              {/* AI深度解读 - 宋代美学风格，突出重点 */}
              <Card className="mb-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-600 shadow-2xl">
                <CardHeader className="text-center relative">
                  {/* 古典装饰 */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-8 opacity-20">
                    <svg viewBox="0 0 64 32" className="w-full h-full text-amber-400">
                      <path d="M8,16 Q16,8 24,16 Q32,8 40,16 Q48,8 56,16 Q48,24 40,16 Q32,24 24,16 Q16,24 8,16 Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  {/* 传统印章式标题 */}
                  <div className="relative inline-block mb-6 mt-4">
                    <div className="absolute inset-0 bg-red-600 dark:bg-red-700 transform rotate-45 rounded-lg opacity-15"></div>
                    <CardTitle className="relative text-3xl font-serif font-bold text-red-700 dark:text-red-400 px-6 py-3 tracking-wider">
                      AI智慧解读
                    </CardTitle>
                  </div>
                  
                  {/* 装饰线 */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-px bg-amber-400 dark:bg-amber-600"></div>
                    <Sparkles className="h-5 w-5 mx-3 text-amber-500" />
                    <div className="w-12 h-px bg-amber-400 dark:bg-amber-600"></div>
                  </div>
                  
                  <p className="text-lg font-serif text-amber-700 dark:text-amber-300 italic">
                    深度解析·智慧启迪·人生指引
                  </p>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  {/* AI解读内容 - Markdown格式支持 */}
                  <div className="bg-white/90 dark:bg-slate-900/90 rounded-lg p-6 border border-amber-200 dark:border-amber-700 shadow-lg">
                    <div className="max-w-none">
                      <LightweightMarkdown
                        content={result.ai_interpretation}
                      />
                      {/* <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // 段落 - 统一格式
                          p: ({children}) => (
                            <p className="mb-6 text-base leading-7 text-slate-700 dark:text-slate-300 font-serif" 
                               style={{ textAlign: 'justify', lineHeight: '1.8' }}>
                              {children}
                            </p>
                          ),
                          // 标题系列 - 清晰层次
                          h1: ({children}) => (
                            <div className="mb-6 mt-8 first:mt-0">
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-600 dark:bg-red-700 transform rotate-45 rounded-md opacity-10"></div>
                                <h1 className="relative text-2xl font-bold text-red-700 dark:text-red-400 px-4 py-3 font-serif tracking-wide">
                                  {children}
                                </h1>
                              </div>
                            </div>
                          ),
                          h2: ({children}) => (
                            <div className="mb-5 mt-7">
                              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 dark:bg-amber-900/20 font-serif">
                                {children}
                              </h2>
                            </div>
                          ),
                          h3: ({children}) => (
                            <div className="mb-4 mt-6">
                              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 border-l-3 border-amber-300 pl-3 py-1 font-serif">
                                {children}
                              </h3>
                            </div>
                          ),
                          // 强调和格式
                          strong: ({children}) => (
                            <strong className="text-orange-700 dark:text-orange-300 font-semibold px-1">
                              {children}
                            </strong>
                          ),
                          em: ({children}) => (
                            <em className="text-amber-700 dark:text-amber-300 italic">
                              {children}
                            </em>
                          ),
                          // 引用块 - 重要信息突出
                          blockquote: ({children}) => (
                            <div className="my-6">
                              <blockquote className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/15 dark:via-amber-900/15 dark:to-yellow-900/15 border-l-4 border-orange-400 p-5 rounded-r-lg shadow-sm">
                                <div className="text-orange-800 dark:text-orange-200 font-medium leading-relaxed">
                                  {children}
                                </div>
                              </blockquote>
                            </div>
                          ),
                          // 有序列表 - 清晰编号
                          ol: ({children}) => (
                            <div className="my-6">
                              <ol className="space-y-3 counter-reset-none">
                                {children}
                              </ol>
                            </div>
                          ),
                          // 无序列表
                          ul: ({children}) => (
                            <div className="my-6">
                              <ul className="space-y-3">
                                {children}
                              </ul>
                            </div>
                          ),
                          // 列表项 - 统一格式
                          li: ({children, ...props}) => {
                            const isOrdered = (props as any).ordered;
                            return (
                              <li className={`${isOrdered ? 'list-decimal' : 'list-disc'} list-inside text-slate-700 dark:text-slate-300 leading-relaxed pl-2`}>
                                <span className="ml-2 font-serif">{children}</span>
                              </li>
                            )
                          },
                          // 代码
                          code: ({children, ...props}) => {
                            const inline = (props as any).inline;
                            if (inline) {
                              return (
                                <code className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-sm font-mono">
                                  {children}
                                </code>
                              )
                            }
                            return (
                              <code className="block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                {children}
                              </code>
                            )
                          },
                          pre: ({children}) => (
                            <div className="my-6">
                              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
                                {children}
                              </pre>
                            </div>
                          ),
                          // 分隔线
                          hr: () => (
                            <div className="my-8">
                              <div className="flex items-center justify-center">
                                <div className="w-16 h-px bg-amber-300 dark:bg-amber-600"></div>
                                <div className="mx-4 w-2 h-2 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                                <div className="w-16 h-px bg-amber-300 dark:bg-amber-600"></div>
                              </div>
                            </div>
                          )
                        }}
                      >
                        {result.ai_interpretation}
                      </ReactMarkdown> */}
                    </div>
                    
                    {/* 底部装饰 */}
                    <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-700">
                      <div className="flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <div className="w-8 h-px bg-amber-400 dark:bg-amber-600"></div>
                        <div className="mx-3 text-sm font-serif">✦ 智慧解读完毕 ✦</div>
                        <div className="w-8 h-px bg-amber-400 dark:bg-amber-600"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 操作按钮 - 古典风格 */}
              <div className="text-center space-y-4">
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    onClick={handleReset} 
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-serif px-8 py-3 shadow-lg border-2 border-amber-300 dark:border-amber-500"
                  >
                    <Moon className="h-5 w-5 mr-2" />
                    解析其他梦境
                  </Button>
                  <Button 
                    onClick={handleSaveReport}
                    disabled={isSaving}
                    variant="outline" 
                    className="border-2 border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-serif px-8 py-3"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    {isSaving ? '保存中...' : '保存报告'}
                  </Button>
                  <Button 
                    onClick={handleShareResult}
                    disabled={isSharing}
                    variant="outline" 
                    className="border-2 border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-serif px-8 py-3"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                    ) : isSharing ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="h-5 w-5 mr-2" />
                    )}
                    {copied ? '已复制' : isSharing ? '分享中...' : '分享结果'}
                  </Button>
                </div>

                {/* 分享图片显示区域 */}
                {showShareImage && shareImageUrl && (
                  <div className="mt-8">
                    <Card className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-serif font-bold text-amber-800 dark:text-amber-200">
                            🌙 分享图片已生成
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCloseShareImage}
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          >
                            ✕
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-amber-700 dark:text-amber-300 font-serif mb-6">
                            您的梦境解析图片已按照宋代美学风格生成，适合分享到小红书等社交平台
                          </p>
                          
                          {/* 分享图片预览 */}
                          <div className="mb-6 flex justify-center">
                            <div className="relative">
                              <Image 
                                src={shareImageUrl} 
                                alt="梦境解析分享图片" 
                                width={384}
                                height={384}
                                className="max-w-sm w-full h-auto rounded-lg shadow-lg border border-amber-200 dark:border-amber-700"
                              />
                              <div className="absolute -top-3 -right-3 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                🌙
                              </div>
                            </div>
                          </div>
                          
                          {/* 操作按钮 */}
                          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button
                              onClick={handleDownloadShareImage}
                              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-serif px-6 py-2"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              下载图片
                            </Button>
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-serif">
                              建议保存到相册后分享到社交平台
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* 底部装饰 */}
                <div className="flex items-center justify-center mt-8 text-amber-600 dark:text-amber-400">
                  <div className="w-12 h-px bg-amber-400 dark:bg-amber-600"></div>
                  <div className="mx-4 text-sm font-serif">✦ 梦境解析完成 ✦</div>
                  <div className="w-12 h-px bg-amber-400 dark:bg-amber-600"></div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer - 宋代美学风格 */}
        <footer className="border-t-2 border-amber-300 dark:border-amber-600 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-sm mt-20 relative">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              {/* 装饰性图案 */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-8 h-px bg-amber-400 dark:bg-amber-600"></div>
                <div className="mx-4 w-4 h-4 border-2 border-amber-400 dark:border-amber-600 rounded-full bg-amber-100 dark:bg-amber-800"></div>
                <div className="w-24 h-px bg-amber-400 dark:bg-amber-600"></div>
                <div className="mx-4 text-amber-600 dark:text-amber-400">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="w-24 h-px bg-amber-400 dark:bg-amber-600"></div>
                <div className="mx-4 w-4 h-4 border-2 border-amber-400 dark:border-amber-600 rounded-full bg-amber-100 dark:bg-amber-800"></div>
                <div className="w-8 h-px bg-amber-400 dark:bg-amber-600"></div>
              </div>
              
              <div className="text-amber-700 dark:text-amber-300">
                <p className="text-lg font-serif mb-2">传承千年智慧，融汇现代科技</p>
                <p className="text-sm font-serif opacity-80">&copy; 2024 天机AI · 梦境解析专家</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}