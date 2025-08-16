'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateSelector } from '@/components/ui/date-selector'
import { TimeSelector } from '@/components/ui/time-selector'
import { CitySelector } from '@/components/ui/city-selector'
import { User, Sparkles, RefreshCw, BookOpen, Star, TrendingUp, TrendingDown, Minus, Download, Share2, Copy, Check } from 'lucide-react'
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
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [showShareImage, setShowShareImage] = useState(false)

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
    setShareImageUrl(null)
    setShowShareImage(false)
  }

  // 保存姓名分析报告
  const handleSaveReport = async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      // 生成报告内容
      const reportContent = generateNameReportContent(result)
      
      // 创建并下载文件
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `姓名分析报告_${result.name}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`
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

  // 分享姓名分析结果
  const handleShareResult = async () => {
    if (!result) return
    
    setIsSharing(true)
    try {
      // 生成分享图片
      const shareImageBlob = await generateNameShareImage(result)
      
      if (shareImageBlob) {
        // 创建图片URL用于页面显示
        const imageUrl = URL.createObjectURL(shareImageBlob)
        setShareImageUrl(imageUrl)
        setShowShareImage(true)
      } else {
        // 降级方案：文本分享
        const shareText = `📝 我在天机AI完成了姓名分析！
👤 姓名：${result.name}
💯 综合评分：${result.scores.overall_score}分
✨ 天机AI为我揭示了姓名中的奥秘
🌟 来体验专业的姓名分析吧！
#天机AI #姓名分析 #姓名学`
        
        if (navigator.share) {
          await navigator.share({
            title: '我的姓名分析报告',
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
        const shareText = `天机AI - ${result.name} 姓名分析\n\n综合评分：${result.scores.overall_score}分\n\n查看详情：${window.location.href}`
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
    a.download = `姓名分析分享_${result?.name}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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

  // 渲染传统风格的AI内容（类似八字分析）
  const renderTraditionalAIContent = (content: string) => {
    // 解析【】标记的内容
    const sections = content.split(/【([^】]+)】/).filter(item => item.trim())
    const sectionData: Array<{title: string, content: string}> = []
    
    for (let i = 0; i < sections.length; i += 2) {
      if (i + 1 < sections.length) {
        const title = sections[i]
        const content = sections[i + 1]
        sectionData.push({ title, content })
      }
    }

    if (sectionData.length === 0) {
      // 如果没有找到【】标记，就作为普通文本处理
      return (
        <div className="prose prose-sm max-w-none">
          {content.split('\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {sectionData.map((section, index) => (
          <div key={index}>
            {renderTraditionalAIBlock(section.title, section.content)}
          </div>
        ))}
      </div>
    )
  }

  // 渲染传统风格的AI分析块
  const renderTraditionalAIBlock = (title: string, content: string) => {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="mb-4">
          <h4 className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {title}
          </h4>
          <div className="w-12 h-px bg-slate-400 dark:bg-slate-500"></div>
        </div>
        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
          {content.split('\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>
    )
  }

  // 生成姓名分析报告内容
  const generateNameReportContent = (data: NameAnalysisResult): string => {
    const date = new Date().toLocaleDateString('zh-CN')
    return `
==============================
          姓名分析报告
==============================

生成时间：${date}
姓名：${data.name}
分析类型：${data.analysis_type === 'current' ? '现有姓名分析' : '改名建议'}

==============================
           基本信息
==============================
姓氏：${data.basic_info.surname} (${data.basic_info.surname_strokes}画)
名字：${data.basic_info.given_name} (${data.basic_info.given_strokes}画)
总笔画：${data.basic_info.total_strokes}画

==============================
           五行分析
==============================
姓氏五行：${data.wuxing_analysis.surname_wuxing}
名字五行：${data.wuxing_analysis.given_wuxing.join('、')}
整体五行：${data.wuxing_analysis.overall_wuxing}
五行配置：${data.wuxing_analysis.wuxing_compatibility}

五行分布：
木：${data.wuxing_analysis.wuxing_balance.wood}
火：${data.wuxing_analysis.wuxing_balance.fire}
土：${data.wuxing_analysis.wuxing_balance.earth}
金：${data.wuxing_analysis.wuxing_balance.metal}
水：${data.wuxing_analysis.wuxing_balance.water}

==============================
           数理分析
==============================
天格：${data.numerology.tiange} (${data.numerology.tiange_fortune})
人格：${data.numerology.renge} (${data.numerology.renge_fortune})
地格：${data.numerology.dige} (${data.numerology.dige_fortune})
外格：${data.numerology.waige} (${data.numerology.waige_fortune})
总格：${data.numerology.zongge} (${data.numerology.zongge_fortune})

==============================
           音韵分析
==============================
声调组合：${data.phonetics.tones.join('-')}
音韵和谐度：${data.phonetics.tone_harmony}
发音难度：${data.phonetics.pronunciation_difficulty}
韵律质量：${data.phonetics.rhyme_quality}

==============================
           字义分析
==============================
积极含义：
${data.meanings.positive_meanings.map(meaning => `• ${meaning}`).join('\n')}

潜在问题：
${data.meanings.potential_issues.map(issue => `• ${issue}`).join('\n')}

文化内涵：
${data.meanings.cultural_connotations.map(connotation => `• ${connotation}`).join('\n')}

==============================
           综合评分
==============================
五行评分：${data.scores.wuxing_score}分
数理评分：${data.scores.numerology_score}分
音韵评分：${data.scores.phonetic_score}分
字义评分：${data.scores.meaning_score}分
综合评分：${data.scores.overall_score}分

==============================
           专业建议
==============================
优势特点：
${data.suggestions.strengths.map(strength => `• ${strength}`).join('\n')}

注意事项：
${data.suggestions.weaknesses.map(weakness => `• ${weakness}`).join('\n')}

改善建议：
${data.suggestions.improvement_suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

吉利方位：
${data.suggestions.lucky_directions.map(direction => `• ${direction}`).join('\n')}

适合职业：
${data.suggestions.suitable_careers.map(career => `• ${career}`).join('\n')}

==============================
          AI深度解读
==============================
${data.ai_analysis}

==============================
本次分析消耗：${data.cost} 天机点
报告由天机AI生成 - 仅供参考
==============================`
  }

  // 生成分享图片
  const generateNameShareImage = async (data: NameAnalysisResult): Promise<Blob | null> => {
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
      
      shareElement.innerHTML = `
        <div style="padding: 32px 24px; height: 100%; display: flex; flex-direction: column; color: #8b4513;">
          <!-- 标题区域 -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background: #dc2626; color: white; display: inline-block; padding: 12px 20px; border-radius: 8px; font-size: 20px; font-weight: bold; margin-bottom: 8px;">
              我的姓名分析报告
            </div>
            <div style="font-size: 14px; color: #a16207;">天机AI · 姓名学解读</div>
          </div>
          
          <!-- 姓名展示 -->
          <div style="background: rgba(255,255,255,0.9); border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 2px solid #f59e0b; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #dc2626; margin-bottom: 8px;">
              ${data.name}
            </div>
            <div style="font-size: 12px; color: #7c2d12;">
              总笔画：${data.basic_info.total_strokes}画 | 五行：${data.wuxing_analysis.overall_wuxing}
            </div>
          </div>
          
          <!-- 综合评分 -->
          <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 2px solid #f59e0b; text-align: center;">
            <div style="font-size: 48px; font-weight: bold; color: ${data.scores.overall_score >= 80 ? '#059669' : data.scores.overall_score >= 60 ? '#2563eb' : data.scores.overall_score >= 40 ? '#d97706' : '#dc2626'}; margin-bottom: 8px;">
              ${data.scores.overall_score}
            </div>
            <div style="font-size: 14px; color: #7c2d12; font-weight: bold;">综合评分</div>
          </div>
          
          <!-- 数理分析 -->
          <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 2px solid #f59e0b;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 16px;">📊</span>
              <span style="font-weight: bold; margin-left: 8px; font-size: 14px;">数理格局</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
              <div>天格：${data.numerology.tiange} (${data.numerology.tiange_fortune})</div>
              <div>人格：${data.numerology.renge} (${data.numerology.renge_fortune})</div>
              <div>地格：${data.numerology.dige} (${data.numerology.dige_fortune})</div>
              <div>总格：${data.numerology.zongge} (${data.numerology.zongge_fortune})</div>
            </div>
          </div>
          
          <!-- 特点优势 -->
          <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 2px solid #f59e0b; flex: 1;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 16px;">✨</span>
              <span style="font-weight: bold; margin-left: 8px; font-size: 14px;">姓名特点</span>
            </div>
            <div style="font-size: 11px; line-height: 1.5; color: #7c2d12;">
              ${data.suggestions.strengths.slice(0, 2).join('；').length > 80 ? data.suggestions.strengths.slice(0, 2).join('；').substring(0, 80) + '...' : data.suggestions.strengths.slice(0, 2).join('；')}
            </div>
          </div>
          
          <!-- 底部装饰 -->
          <div style="text-align: center; padding-top: 16px; border-top: 2px solid #f59e0b;">
            <div style="font-size: 12px; color: #a16207; font-weight: bold;">扫码体验专业的姓名分析</div>
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

              {/* 姓名展示与核心信息 - 宋代美学风格 */}
              <Card className="mb-6 shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center pb-3">
                  <div className="text-sm font-serif text-slate-600 dark:text-slate-400 mb-1">
                    {result.analysis_type === 'current' ? '现有姓名分析' : '起名建议分析'}
                  </div>
                  <CardTitle className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-3">
                    {result.name}
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* 左侧：姓名结构分析 */}
                    <div className="space-y-4">
                      {/* 姓名拆解 */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-center mb-4">
                          <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">姓名结构</h4>
                          <div className="w-12 h-px bg-slate-300 dark:bg-slate-600 mx-auto mt-2"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* 姓氏 */}
                          <div className="text-center">
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {result.basic_info.surname}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">姓氏 · {result.basic_info.surname_strokes}画</div>
                            </div>
                            <div className="mt-2">
                              <Badge className={getWuxingColor(result.wuxing_analysis.surname_wuxing)} variant="outline">
                                {result.wuxing_analysis.surname_wuxing}
                              </Badge>
                            </div>
                          </div>
                          {/* 名字 */}
                          <div className="text-center">
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {result.basic_info.given_name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">名字 · {result.basic_info.given_strokes}画</div>
                            </div>
                            <div className="mt-2 flex justify-center space-x-1">
                              {result.wuxing_analysis.given_wuxing.map((wuxing, index) => (
                                <Badge key={index} className={getWuxingColor(wuxing)} variant="outline">
                                  {wuxing}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* 总笔画 */}
                        <div className="mt-4 text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="text-base font-serif text-slate-600 dark:text-slate-400">
                            总笔画：<span className="font-bold text-slate-700 dark:text-slate-300">{result.basic_info.total_strokes}</span>画
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            整体五行：<Badge className={getWuxingColor(result.wuxing_analysis.overall_wuxing)} variant="outline">
                              {result.wuxing_analysis.overall_wuxing}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 右侧：综合评分与核心指标 */}
                    <div className="space-y-4">
                      {/* 综合评分 */}
                      <div className="text-center bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-5xl font-serif font-bold mb-3">
                          <span className={`${getScoreColor(result.scores.overall_score)} drop-shadow-sm`}>
                            {result.scores.overall_score}
                          </span>
                          <span className="text-2xl font-serif text-slate-500 dark:text-slate-400">分</span>
                        </div>
                        <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white font-serif px-3 py-1">
                          综合评价
                        </Badge>
                        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                          五行配合：{result.wuxing_analysis.wuxing_compatibility}
                        </div>
                      </div>

                      {/* 各项评分 */}
                      <div className="space-y-3">
                        {Object.entries(result.scores).filter(([key]) => key !== 'overall_score').map(([key, score]) => {
                          const labels = {
                            wuxing_score: '五行评分',
                            numerology_score: '数理评分',
                            phonetic_score: '音韵评分',
                            meaning_score: '寓意评分'
                          }
                          const icons = {
                            wuxing_score: '⚊',
                            numerology_score: '算',
                            phonetic_score: '音',
                            meaning_score: '意'
                          }
                          
                          return (
                            <div key={key} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                    <span className="text-xs font-serif font-bold text-slate-600 dark:text-slate-400">
                                      {icons[key as keyof typeof icons]}
                                    </span>
                                  </div>
                                  <span className="text-xs font-serif font-semibold text-slate-700 dark:text-slate-300">
                                    {labels[key as keyof typeof labels]}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {getScoreIcon(score)}
                                  <span className={`text-base font-serif font-bold ${getScoreColor(score)}`}>
                                    {score}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* 五行分析 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    五行配置分析
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* 左侧：五行分布 */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行分布</h4>
                        <div className="space-y-4">
                          {Object.entries(result.wuxing_analysis.wuxing_balance).map(([element, count]) => {
                            const elementNames = {
                              wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
                            }
                            const elementColors = {
                              wood: 'bg-green-500',
                              fire: 'bg-red-500',
                              earth: 'bg-yellow-500',
                              metal: 'bg-gray-500',
                              water: 'bg-blue-500'
                            }
                            return (
                              <div key={element} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 rounded-full ${elementColors[element as keyof typeof elementColors]} border border-slate-300 dark:border-slate-600`}></div>
                                  <span className="text-sm font-serif text-slate-700 dark:text-slate-300">
                                    {elementNames[element as keyof typeof elementNames]}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${elementColors[element as keyof typeof elementColors]}`}
                                      style={{width: `${Math.min(count * 20, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-serif font-bold text-slate-600 dark:text-slate-400 w-6">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行配合</h4>
                        <div className="text-center">
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                            {result.wuxing_analysis.wuxing_compatibility}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 右侧：五行属性展示 */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行属性</h4>
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">姓氏五行</div>
                            <Badge className={`${getWuxingColor(result.wuxing_analysis.surname_wuxing)} text-lg px-4 py-2`}>
                              {result.wuxing_analysis.surname_wuxing}
                            </Badge>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">名字五行</div>
                            <div className="flex justify-center space-x-2">
                              {result.wuxing_analysis.given_wuxing.map((wuxing, index) => (
                                <Badge key={index} className={`${getWuxingColor(wuxing)} px-3 py-1`}>
                                  {wuxing}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">整体五行</div>
                            <Badge className={`${getWuxingColor(result.wuxing_analysis.overall_wuxing)} text-lg px-4 py-2`}>
                              {result.wuxing_analysis.overall_wuxing}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 数理分析 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    数理格局分析
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-center mb-6">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-serif">五格数理</div>
                    </div>
                    <div className="grid md:grid-cols-5 gap-6">
                      {Object.entries(result.numerology).filter(([key]) => !key.includes('_fortune')).map(([key, value]) => {
                        const labels = {
                          tiange: '天格',
                          dige: '地格',
                          renge: '人格',
                          waige: '外格',
                          zongge: '总格'
                        }
                        const descriptions = {
                          tiange: '祖运',
                          dige: '前运',
                          renge: '主运',
                          waige: '副运',
                          zongge: '后运'
                        }
                        const fortuneKey = `${key}_fortune` as keyof typeof result.numerology
                        const fortune = result.numerology[fortuneKey] as string
                        const isMainGe = key === 'renge' // 人格是主格
                        
                        return (
                          <div key={key} className="text-center relative">
                            <div className={`bg-white dark:bg-slate-900 p-4 rounded-lg border transition-all duration-200 ${
                              isMainGe 
                                ? 'border-2 border-slate-400 dark:border-slate-500 shadow-md' 
                                : 'border border-slate-200 dark:border-slate-700'
                            }`}>
                              {isMainGe && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                  <Badge variant="secondary" className="bg-slate-700 text-white border-0 text-xs px-2 py-0.5">
                                    主格
                                  </Badge>
                                </div>
                              )}
                              <div className="space-y-2">
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                                  {labels[key as keyof typeof labels]}
                                </div>
                                <div className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300">
                                  {value}
                                </div>
                                <div className="w-8 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                                <Badge className={`${getFortuneColor(fortune)} text-xs px-2 py-1`}>
                                  {fortune}
                                </Badge>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {descriptions[key as keyof typeof descriptions]}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 音韵分析 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    音韵特点分析
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">声调组合</h4>
                        <div className="flex justify-center space-x-3">
                          {result.phonetics.tones.map((tone, index) => (
                            <div key={index} className="text-center">
                              <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center">
                                <span className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">
                                  {tone}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {tone}调
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">音调和谐度</h4>
                        <div className="text-center">
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                            {result.phonetics.tone_harmony}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">发音难易度</h4>
                        <div className="text-center">
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                            {result.phonetics.pronunciation_difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">韵律美感</h4>
                        <div className="text-center">
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                            {result.phonetics.rhyme_quality}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 寓意分析与改进建议 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    寓意分析与改进建议
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 左侧：优势特点 */}
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">积极寓意</h4>
                        <ul className="space-y-2">
                          {result.meanings.positive_meanings.map((meaning, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{meaning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">姓名优势</h4>
                        <ul className="space-y-2">
                          {result.suggestions.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 右侧：改进建议 */}
                    <div className="space-y-4">
                      {result.meanings.potential_issues.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">注意事项</h4>
                          <ul className="space-y-2">
                            {result.meanings.potential_issues.map((issue, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.suggestions.weaknesses.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">待改进方面</h4>
                          <ul className="space-y-2">
                            {result.suggestions.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.suggestions.improvement_suggestions.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">改进建议</h4>
                          <ul className="space-y-2">
                            {result.suggestions.improvement_suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 人生指导 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    人生指导
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">有利方位</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {result.suggestions.lucky_directions.map((direction, index) => (
                          <Badge key={index} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                            {direction}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">适合职业</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {result.suggestions.suitable_careers.map((career, index) => (
                          <Badge key={index} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                            {career}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 文化内涵 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    文化内涵
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <ul className="space-y-3">
                      {result.meanings.cultural_connotations.map((connotation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{connotation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* AI专业分析 - 宋代美学风格 */}
              <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-3 text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span>AI智能解读</span>
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 dark:border-slate-700">
                    {renderTraditionalAIContent(result.ai_analysis)}
                  </div>
                </CardContent>
              </Card>

              {/* 操作按钮 - 宋代美学风格 */}
              <div className="text-center space-x-4">
                <Button onClick={handleReset} className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-serif">
                  <User className="h-4 w-4 mr-2" />
                  分析其他姓名
                </Button>
                <Button 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? '保存中...' : '保存报告'}
                </Button>
                <Button 
                  onClick={handleShareResult}
                  disabled={isSharing}
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : isSharing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
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
                          📝 分享图片已生成
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
                          您的姓名分析图片已按照宋代美学风格生成，适合分享到小红书等社交平台
                        </p>
                        
                        {/* 分享图片预览 */}
                        <div className="mb-6 flex justify-center">
                          <div className="relative">
                            <Image 
                              src={shareImageUrl} 
                              alt="姓名分析分享图片" 
                              width={384}
                              height={384}
                              className="max-w-sm w-full h-auto rounded-lg shadow-lg border border-amber-200 dark:border-amber-700"
                            />
                            <div className="absolute -top-3 -right-3 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              📝
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

              {/* 历史记录提示 - 宋代美学风格 */}
              <div className="mt-6">
                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
                  <CardContent className="p-5 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-base font-serif font-semibold text-amber-800 dark:text-amber-200">
                        分析已保存
                      </h3>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-serif mb-3">
                      本次姓名分析结果已自动保存到您的历史记录中，您可以随时查看和回顾所有分析结果。
                    </p>
                    <Link href="/history">
                      <Button variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-serif text-sm">
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