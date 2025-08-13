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
import { Heart, ArrowLeft, Users, Sparkles, Calendar, User, RefreshCw, Download, Share2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { EnhancedHepanResult } from '@/components/modules/EnhancedHepanResult'

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
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [showShareImage, setShowShareImage] = useState(false)

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

  // 保存合盘报告
  const handleSaveReport = async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      // 生成报告内容
      const reportContent = generateHepanReportContent(result)
      
      // 创建并下载文件
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `合盘分析报告_${result.person1.name}_${result.person2.name}_${new Date().toLocaleDateString()}.txt`
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

  // 分享合盘结果
  const handleShareResult = async () => {
    if (!result) return
    
    setIsSharing(true)
    try {
      // 生成分享图片
      const shareImageBlob = await generateHepanShareImage(result)
      
      if (shareImageBlob) {
        // 创建图片URL用于页面显示
        const imageUrl = URL.createObjectURL(shareImageBlob)
        setShareImageUrl(imageUrl)
        setShowShareImage(true)
      } else {
        // 降级方案：文本分享
        const shareText = `💕 我在天机AI完成了合盘配对分析！

👫 配对：${result.person1.name} & ${result.person2.name}
💯 综合匹配度：${result.compatibility.overall_score}分
🌟 来体验专业的合盘分析吧！

#天机AI #合盘配对 #八字合盘`

        if (navigator.share) {
          await navigator.share({
            title: `天机AI - ${result.person1.name} & ${result.person2.name} 合盘分析`,
            text: shareText,
            url: window.location.href
          })
        } else {
          await navigator.clipboard.writeText(shareText + `\n\n查看详情：${window.location.href}`)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    } catch (error) {
      console.error('生成分享图片失败:', error)
      // 降级到文本分享
      try {
        const shareText = `天机AI合盘分析 - ${result.person1.name} & ${result.person2.name}\n综合匹配度：${result.compatibility.overall_score}分\n\n查看详情：${window.location.href}`
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

  const handleDownloadImage = () => {
    if (shareImageUrl) {
      const a = document.createElement('a')
      a.href = shareImageUrl
      a.download = `天机AI合盘分析_${result?.person1.name || ''}_${result?.person2.name || ''}_${new Date().toLocaleDateString().replace(/\//g, '')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleCloseShareImage = () => {
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl)
      setShareImageUrl(null)
    }
    setShowShareImage(false)
  }

  // 生成合盘报告内容
  const generateHepanReportContent = (data: HepanResult): string => {
    const date = new Date().toLocaleDateString('zh-CN')
    return `
==============================
天机AI - 八字合盘分析报告
配对：${data.person1.name} & ${data.person2.name}
生成时间：${date}
==============================

【综合匹配度】
总分：${data.compatibility.overall_score}分

【详细分析】
五行匹配：${data.compatibility.wuxing_compatibility}分
干支匹配：${data.compatibility.ganzhi_compatibility}分
用神匹配：${data.compatibility.yongshen_compatibility}分
大运匹配：${data.compatibility.dayun_compatibility}分

【生活领域评分】
感情匹配：${data.detailed_scores.love_score}分
事业协作：${data.detailed_scores.career_score}分
财运相合：${data.detailed_scores.wealth_score}分
健康互补：${data.detailed_scores.health_score}分
家庭和谐：${data.detailed_scores.family_score}分

【关系优势】
${data.analysis.strengths.map((item, index) => `${index + 1}. ${item}`).join('\n')}

【潜在挑战】
${data.analysis.challenges.map((item, index) => `${index + 1}. ${item}`).join('\n')}

【改善建议】
${data.analysis.suggestions.map((item, index) => `${index + 1}. ${item}`).join('\n')}

【AI智能分析】
${data.ai_analysis}

==============================
本次分析消耗：${data.cost} 天机点
报告由天机AI生成 - 仅供参考
==============================`
  }

  // 生成合盘分享图片
  const generateHepanShareImage = async (data: HepanResult): Promise<Blob | null> => {
    try {
      const shareElement = document.createElement('div')
      shareElement.style.width = '450px'
      shareElement.style.height = '800px'
      shareElement.style.fontFamily = 'Arial, SimSun, serif'
      shareElement.style.position = 'relative'
      shareElement.style.overflow = 'hidden'
      
      shareElement.innerHTML = `
        <div style="
          background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 70%, #f9a8d4 100%);
          padding: 40px 30px;
          height: 100%;
          box-sizing: border-box;
          position: relative;
          color: #4a5568;
          font-family: 'Times New Roman', 'SimSun', serif;
        ">
          <!-- 装饰元素 -->
          <div style="
            position: absolute;
            top: 30px;
            right: 30px;
            width: 80px;
            height: 80px;
            border: 1px solid rgba(236, 72, 153, 0.3);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
          "></div>
          
          <!-- 标题 -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="
              position: relative;
              display: inline-block;
              padding: 15px 25px;
              background: rgba(236, 72, 153, 0.1);
              border: 2px solid rgba(236, 72, 153, 0.4);
              border-radius: 8px;
              margin-bottom: 12px;
            ">
              <div style="
                color: #be185d;
                font-size: 24px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                letter-spacing: 2px;
              ">天机AI·八字合盘</div>
            </div>
            <div style="
              color: #be185d;
              font-size: 13px;
              font-style: italic;
              letter-spacing: 1px;
            ">缘分天定 · 匹配有数</div>
          </div>
          
          <!-- 配对信息 -->
          <div style="
            background: rgba(255, 255, 255, 0.85);
            border: 2px solid rgba(236, 72, 153, 0.2);
            border-radius: 12px;
            padding: 25px 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(236, 72, 153, 0.1);
          ">
            <div style="text-align: center; margin-bottom: 20px;">
              <h3 style="
                color: #be185d;
                font-size: 18px;
                font-weight: bold;
                margin: 0;
                letter-spacing: 1px;
              ">配对分析</h3>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            ">
              <div style="text-align: center; flex: 1;">
                <div style="
                  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                  border-radius: 15px;
                  padding: 15px 10px;
                  margin-bottom: 8px;
                ">
                  <div style="font-size: 16px; font-weight: bold; color: #1e40af;">${data.person1.name}</div>
                </div>
              </div>
              <div style="
                font-size: 20px;
                color: #ec4899;
                margin: 0 15px;
              ">💕</div>
              <div style="text-align: center; flex: 1;">
                <div style="
                  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
                  border-radius: 15px;
                  padding: 15px 10px;
                  margin-bottom: 8px;
                ">
                  <div style="font-size: 16px; font-weight: bold; color: #be185d;">${data.person2.name}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 匹配度评分 -->
          <div style="
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          ">
            <h3 style="
              color: #be185d;
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 20px 0;
            ">综合匹配度</h3>
            <div style="
              font-size: 48px;
              font-weight: bold;
              color: ${data.compatibility.overall_score >= 80 ? '#059669' : data.compatibility.overall_score >= 60 ? '#2563eb' : '#d97706'};
              margin-bottom: 10px;
            ">
              ${data.compatibility.overall_score}<span style="font-size: 24px;">分</span>
            </div>
            <div style="
              color: #6b7280;
              font-size: 14px;
            ">
              ${data.compatibility.overall_score >= 80 ? '天作之合' : data.compatibility.overall_score >= 60 ? '相配良缘' : '需要磨合'}
            </div>
          </div>
          
          <!-- 分析要点 -->
          <div style="
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          ">
            <div style="margin-bottom: 12px; text-align: center;">
              <span style="font-size: 20px;">🎯</span>
            </div>
            <p style="
              color: #0c4a6e;
              font-size: 14px;
              font-weight: 600;
              margin: 0 0 8px 0;
              line-height: 1.4;
              text-align: center;
            ">AI智能合盘分析</p>
            <p style="
              color: #0369a1;
              font-size: 12px;
              margin: 0;
              line-height: 1.3;
              text-align: center;
            ">基于传统八字理论的现代化智能分析<br/>为您的感情提供专业指导</p>
          </div>
          
          <!-- 底部品牌 -->
          <div style="
            text-align: center;
            margin-top: auto;
            padding: 15px 20px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          ">
            <div style="
              background: linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6);
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            ">天机AI</div>
            <p style="
              font-size: 11px;
              margin: 0;
              color: #6b7280;
            ">传统智慧 × 现代科技</p>
          </div>
        </div>
      `
      
      shareElement.style.position = 'absolute'
      shareElement.style.left = '-9999px'
      document.body.appendChild(shareElement)
      
      const canvas = await html2canvas(shareElement, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#fdf2f8',
        width: 450,
        height: 800,
        scrollX: 0,
        scrollY: 0
      })
      
      document.body.removeChild(shareElement)
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/png', 0.9)
      })
      
    } catch (error) {
      console.error('生成分享图片失败:', error)
      return null
    }
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

              {/* 使用增强版合盘结果组件 */}
              <EnhancedHepanResult result={result} />

              {/* 操作按钮 */}
              <div className="text-center space-x-4 mb-8">
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
                <Button 
                  variant="outline" 
                  onClick={handleSaveReport}
                  disabled={isSaving}
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
                  variant="outline"
                  onClick={handleShareResult}
                  disabled={isSharing}
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

              {/* 分享图片显示区域 - 宋代美学风格 */}
              {showShareImage && shareImageUrl && (
                <div className="mt-8">
                  <Card className="bg-gradient-to-br from-rose-50/90 to-pink-50/90 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-serif font-bold text-rose-800 dark:text-rose-200">
                          💕 分享图片已生成
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseShareImage}
                          className="text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                        >
                          ✕
                        </Button>
                      </div>
                      <div className="w-24 h-px bg-rose-300 dark:bg-rose-600"></div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-rose-700 dark:text-rose-300 font-serif mb-6">
                          您的合盘分析图片已按照宋代美学风格生成，适合分享到小红书等社交平台
                        </p>
                        
                        {/* 分享图片预览 */}
                        <div className="mb-6 flex justify-center">
                          <div className="relative">
                            <img 
                              src={shareImageUrl} 
                              alt="合盘分析分享图片" 
                              className="max-w-sm w-full h-auto rounded-lg shadow-lg border border-rose-200 dark:border-rose-700"
                            />
                            <div className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              💕
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <Button 
                            onClick={handleDownloadImage}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-serif px-6 py-2"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            下载图片
                          </Button>
                          <p className="text-sm text-rose-600 dark:text-rose-400 font-serif">
                            建议保存到相册后分享到社交平台
                          </p>
                        </div>

                        {/* 使用提示 */}
                        <div className="mt-6 p-4 bg-rose-100/50 dark:bg-rose-900/20 rounded-lg border border-rose-200/50 dark:border-rose-700/30">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">💡</span>
                            </div>
                            <div className="text-left">
                              <h4 className="font-serif font-semibold text-rose-800 dark:text-rose-200 text-sm mb-1">分享建议</h4>
                              <p className="text-rose-700 dark:text-rose-300 text-xs leading-relaxed font-serif">
                                • 图片采用9:16比例，完美适配小红书、抖音等竖屏平台<br/>
                                • 专为合盘分析设计的粉色美学风格<br/>
                                • 高清输出，确保分享时清晰度最佳
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

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