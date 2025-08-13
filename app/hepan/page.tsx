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
import { CompactHepanResult } from '@/components/modules/CompactHepanResult'

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
  relationship_type?: string
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
      console.error('分享失败:', error)
      try {
        const shareText = `天机AI - ${result.person1.name} & ${result.person2.name} 合盘分析\n\n综合匹配度：${result.compatibility.overall_score}分\n\n查看详情：${window.location.href}`
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
五行相合度：${data.compatibility.wuxing_compatibility}分
干支相合度：${data.compatibility.ganzhi_compatibility}分
用神相合度：${data.compatibility.yongshen_compatibility}分
大运相合度：${data.compatibility.dayun_compatibility}分

【生活领域评分】
感情和谐度：${data.detailed_scores.love_score}分
事业协作度：${data.detailed_scores.career_score}分
财运相合度：${data.detailed_scores.wealth_score}分
健康互补度：${data.detailed_scores.health_score}分
家庭和睦度：${data.detailed_scores.family_score}分

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

  // 生成分享图片
  const generateHepanShareImage = async (data: HepanResult): Promise<Blob | null> => {
    try {
      // 创建canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      // 设置canvas尺寸 (9:16比例，适合社交媒体)
      canvas.width = 720
      canvas.height = 1280

      // 粉色渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#fdf2f8')
      gradient.addColorStop(0.5, '#fce7f3')
      gradient.addColorStop(1, '#fbcfe8')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 设置字体
      ctx.fillStyle = '#be185d'
      ctx.font = 'bold 48px serif'
      ctx.textAlign = 'center'
      
      // 标题
      ctx.fillText('💕 合盘配对分析', canvas.width / 2, 100)
      
      // 配对信息
      ctx.font = '32px serif'
      ctx.fillStyle = '#831843'
      ctx.fillText(`${data.person1.name} & ${data.person2.name}`, canvas.width / 2, 180)
      
      // 综合评分
      ctx.font = 'bold 120px serif'
      ctx.fillStyle = '#be185d'
      ctx.fillText(`${data.compatibility.overall_score}`, canvas.width / 2, 350)
      
      ctx.font = '24px serif'
      ctx.fillStyle = '#9d174d'
      ctx.fillText('综合匹配度', canvas.width / 2, 390)

      // 生活领域评分
      const scores = [
        { label: '感情和谐', value: data.detailed_scores.love_score },
        { label: '事业协作', value: data.detailed_scores.career_score },
        { label: '财运相合', value: data.detailed_scores.wealth_score },
        { label: '健康互补', value: data.detailed_scores.health_score },
        { label: '家庭和睦', value: data.detailed_scores.family_score }
      ]

      ctx.font = '24px serif'
      let yPos = 480
      scores.forEach((score, index) => {
        ctx.fillStyle = '#9d174d'
        ctx.textAlign = 'left'
        ctx.fillText(score.label, 80, yPos)
        
        ctx.fillStyle = '#be185d'
        ctx.textAlign = 'right'
        ctx.fillText(`${score.value}分`, canvas.width - 80, yPos)
        
        yPos += 50
      })

      // 主要优势
      ctx.font = 'bold 28px serif'
      ctx.fillStyle = '#be185d'
      ctx.textAlign = 'center'
      ctx.fillText('✨ 主要优势', canvas.width / 2, 800)

      ctx.font = '22px serif'
      ctx.fillStyle = '#831843'
      ctx.textAlign = 'left'
      const maxAdvantages = Math.min(data.analysis.strengths.length, 3)
      for (let i = 0; i < maxAdvantages; i++) {
        const text = data.analysis.strengths[i]
        const maxWidth = canvas.width - 120
        const lines = wrapText(ctx, text, maxWidth)
        
        lines.forEach((line, lineIndex) => {
          ctx.fillText(`${i === 0 && lineIndex === 0 ? '• ' : '  '}${line}`, 60, 850 + i * 80 + lineIndex * 25)
        })
      }

      // 底部信息
      ctx.font = '20px serif'
      ctx.fillStyle = '#9d174d'
      ctx.textAlign = 'center'
      ctx.fillText('天机AI - 专业八字合盘分析', canvas.width / 2, canvas.height - 80)
      ctx.fillText('传统智慧，现代科技', canvas.width / 2, canvas.height - 50)

      // 转换为Blob
      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
    } catch (error) {
      console.error('生成分享图片失败:', error)
      return null
    }
  }

  // 文本换行处理
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split('')
    const lines: string[] = []
    let currentLine = ''

    for (const char of words) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

  const handleCloseShareImage = () => {
    setShowShareImage(false)
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl)
      setShareImageUrl(null)
    }
  }

  const handleDownloadImage = () => {
    if (!shareImageUrl) return
    
    const a = document.createElement('a')
    a.href = shareImageUrl
    a.download = `合盘分析_${result?.person1.name}_${result?.person2.name}_${new Date().toLocaleDateString()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
        {/* Navigation */}
        <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost" size="sm" className="font-serif text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-rose-500" />
                <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">合盘配对</h1>
              </div>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          {/* 页面标题和描述 */}
          <section className="text-center mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50 rounded-full mb-6">
                <Heart className="h-10 w-10 text-rose-500" />
              </div>
              <h2 className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
                八字合盘配对
              </h2>
              <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-serif max-w-2xl mx-auto leading-relaxed">
                基于传统八字命理学，分析两人的性格匹配度、感情走向和相处之道。
                <br />
                从天干地支的生克制化，到五行平衡的互补关系，为您揭示缘分的奥秘。
              </p>
            </div>
          </section>

          {/* 输入表单 */}
          {!result && !isAnalyzing && (
            <section className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* 第一人信息 */}
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

                {/* 第二人信息 */}
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

              {/* 关系类型选择 */}
              <Card className="mb-8 shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                    关系类型
                  </CardTitle>
                  <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-2"></div>
                  <CardDescription className="text-base font-serif text-slate-600 dark:text-slate-400">
                    请选择两人的关系类型，以获得更精准的分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Select value={relationshipType} onValueChange={(value: typeof relationshipType) => setRelationshipType(value)}>
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="couple">情侣关系</SelectItem>
                        <SelectItem value="friends">朋友关系</SelectItem>
                        <SelectItem value="colleagues">合作关系</SelectItem>
                        <SelectItem value="family">亲属关系</SelectItem>
                        <SelectItem value="other">其他关系</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 错误信息 */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 font-serif text-center">{error}</p>
                </div>
              )}

              {/* 分析按钮 */}
              <div className="text-center">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-serif px-12 py-4 text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      开始合盘分析
                    </>
                  )}
                </Button>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-serif">
                  * 本次分析将消耗 300 天机点
                </p>
              </div>
            </section>
          )}

          {/* 分析中状态 */}
          {isAnalyzing && (
            <section className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50 rounded-full mb-6">
                <RefreshCw className="h-10 w-10 text-rose-500 animate-spin" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
                正在分析中...
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-serif">
                AI正在深度分析两人的八字命盘，请稍候...
              </p>
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

              {/* 使用紧凑版合盘结果组件 */}
              <CompactHepanResult result={result} />

              {/* 操作按钮 */}
              <div className="text-center space-x-4 mb-8">
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

              {/* 分享图片显示区域 */}
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
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16">
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