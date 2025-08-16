'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Heart, Briefcase, Home, DollarSign, Shield } from 'lucide-react'

interface CompactHepanResultData {
  success: boolean
  person1: {
    name: string
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
    }
  }
  person2: {
    name: string
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
    }
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
}

interface CompactHepanResultProps {
  result: CompactHepanResultData
}

export function CompactHepanResult({ result }: CompactHepanResultProps) {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(true)
  const [scoreAnimated, setScoreAnimated] = useState(false)
  
  // 优化评分算法，让分数稍微高一点
  const optimizeScore = (originalScore: number): number => {
    const adjusted = Math.min(95, Math.round(originalScore * 1.15 + 8))
    return adjusted
  }

  // 获取关系类型配置 - 雅黑色系宋代美学
  const getRelationshipConfig = (score: number, type?: string) => {
    const configs = {
      couple: {
        colors: ['text-slate-800', 'bg-slate-50', 'border-slate-200'],
        labels: score >= 85 ? '天作之合' : score >= 75 ? '佳偶天成' : score >= 65 ? '相濡以沫' : score >= 50 ? '磨合成长' : '需要努力',
        icon: '💕'
      },
      friends: {
        colors: ['text-slate-800', 'bg-slate-50', 'border-slate-200'],
        labels: score >= 85 ? '知音难觅' : score >= 75 ? '志同道合' : score >= 65 ? '相处融洽' : score >= 50 ? '友情可期' : '需要磨合',
        icon: '🤝'
      },
      colleagues: {
        colors: ['text-slate-800', 'bg-slate-50', 'border-slate-200'], 
        labels: score >= 85 ? '黄金搭档' : score >= 75 ? '合作无间' : score >= 65 ? '配合默契' : score >= 50 ? '互补共赢' : '需要协调',
        icon: '💼'
      },
      family: {
        colors: ['text-slate-800', 'bg-slate-50', 'border-slate-200'],
        labels: score >= 85 ? '血浓于水' : score >= 75 ? '家和万事兴' : score >= 65 ? '亲情深厚' : score >= 50 ? '家庭和睦' : '需要包容',
        icon: '🏠'
      }
    }
    
    const key = (type as keyof typeof configs) || 'couple'
    return configs[key] || configs.couple
  }

  // 触发评分动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setScoreAnimated(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // 十神关系分析
  const getTianshenRelation = (person1Bazi: any, person2Bazi: any) => {
    const relations = [
      { name: '正官', description: '代表责任感和管束力', compatibility: '相互约束，有助成长' },
      { name: '偏财', description: '代表机遇和外财', compatibility: '财运互补，合作有利' },
      { name: '食神', description: '代表才华和表达', compatibility: '互相欣赏，关系和谐' },
      { name: '比肩', description: '代表同类和竞争', compatibility: '性格相似，易生共鸣' },
      { name: '劫财', description: '代表竞争和冲突', compatibility: '需要协调，避免争执' }
    ]
    
    return relations.slice(0, Math.floor(Math.random() * 2) + 2)
  }

  // 大运同步性分析
  const getDayunSync = (compatibility: any) => {
    const syncScore = optimizeScore(compatibility.dayun_compatibility)
    let syncLevel = ''
    let description = ''
    
    if (syncScore >= 85) {
      syncLevel = '高度同步'
      description = '未来10年运势基本一致，共同发展前景极佳'
    } else if (syncScore >= 70) {
      syncLevel = '较为同步'  
      description = '大部分时期运势相合，偶有起伏但总体向好'
    } else if (syncScore >= 55) {
      syncLevel = '部分同步'
      description = '某些时期运势一致，需要互相扶持度过低谷'
    } else {
      syncLevel = '需要协调'
      description = '运势起伏不一，更需要相互理解和支持'
    }
    
    return { score: syncScore, level: syncLevel, description }
  }

  // 子女缘分分析
  const getChildrenFate = (person1Bazi: any, person2Bazi: any) => {
    const scores = [
      optimizeScore(Math.random() * 40 + 50), // 子女运势
      optimizeScore(Math.random() * 30 + 60), // 教育观念 
      optimizeScore(Math.random() * 35 + 55)  // 家庭氛围
    ]
    
    const avgScore = Math.round(scores.reduce((a, b) => a + b) / scores.length)
    
    return {
      childrenLuck: scores[0],
      educationHarmony: scores[1], 
      familyAtmosphere: scores[2],
      overall: avgScore,
      analysis: avgScore >= 75 ? '子女缘分深厚，家庭幸福美满' : 
               avgScore >= 60 ? '子女运势良好，教育理念需要磨合' : 
               '需要更多沟通，共同营造温馨家庭氛围'
    }
  }

  const relationConfig = getRelationshipConfig(
    optimizeScore(result.compatibility.overall_score), 
    result.relationship_type
  )
  
  const tianshenRelations = getTianshenRelation(result.person1.bazi, result.person2.bazi)
  const dayunSync = getDayunSync(result.compatibility)
  const childrenFate = getChildrenFate(result.person1.bazi, result.person2.bazi)

  return (
    <div className="bg-gradient-to-br from-slate-100 via-gray-50 to-stone-100 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 min-h-screen -m-4 p-6 relative">
      {/* 雅黑风格宋代装饰背景 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {/* 古典圆形装饰 */}
        <div className="absolute top-32 left-32 w-64 h-64 border-4 border-slate-300 dark:border-slate-600 rounded-full opacity-15"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 border-2 border-slate-400 dark:border-slate-500 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-gray-400 dark:border-gray-600 rounded-full opacity-25"></div>
        
        {/* 宋代风格几何图案 */}
        <div className="absolute top-20 right-20 w-16 h-16 border-2 border-slate-500 dark:border-slate-400 opacity-30 transform rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border border-gray-500 dark:border-gray-400 opacity-25 transform rotate-12"></div>
        
        {/* 散点装饰 */}
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full opacity-40"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full opacity-45"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-slate-600 dark:bg-slate-300 rounded-full opacity-35"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* 核心评分区域 - 雅黑风格宋代典雅 */}
        <Card className="bg-white/95 dark:bg-slate-900/95 border-slate-300 dark:border-slate-600 shadow-2xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 via-gray-100 to-stone-100 dark:from-slate-800 dark:via-slate-700 dark:to-gray-800 p-8 border-b-2 border-slate-200 dark:border-slate-600">
            <div className="text-center">
              {/* 雅黑风格主评分 */}
              <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
                {/* 外层装饰圆环 */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-400 dark:border-slate-500 opacity-25"></div>
                <div className="absolute inset-2 rounded-full border-2 border-gray-400 dark:border-gray-500 opacity-35"></div>
                
                {/* 评分核心区域 */}
                <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 shadow-lg border-2 border-slate-500 dark:border-slate-400">
                  <div className={`text-4xl font-bold font-serif text-slate-800 dark:text-slate-200 transition-all duration-1000 ${scoreAnimated ? 'scale-100' : 'scale-0'}`}>
                    {optimizeScore(result.compatibility.overall_score)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-serif tracking-wide">综合匹配</div>
                </div>
              </div>
              
              {/* 关系标签 - 雅黑风格 */}
              <div className="mb-6">
                <div className="inline-block relative">
                  <div className="bg-gradient-to-r from-slate-200 to-gray-200 dark:from-slate-700 dark:to-gray-700 px-8 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-500 shadow-md">
                    <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200">
                      {relationConfig.icon} {relationConfig.labels}
                    </span>
                  </div>
                  {/* 装饰角标 */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                  {result.person1.name} 与 {result.person2.name}
                </h2>
                <div className="w-24 h-px bg-slate-500 dark:bg-slate-400 mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400 font-serif text-lg">八字合盘解析</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 雅黑风格维度卡片 */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg transition-all duration-300 rounded-lg group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 border-2 border-red-300 dark:border-red-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-serif font-medium text-slate-700 dark:text-slate-300 mb-3 tracking-wide">感情和谐</h3>
              <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-3">
                {optimizeScore(result.detailed_scores.love_score)}
                <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">分</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                  style={{width: `${optimizeScore(result.detailed_scores.love_score)}%`}} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg transition-all duration-300 rounded-lg group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-300 dark:border-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-serif font-medium text-slate-700 dark:text-slate-300 mb-3 tracking-wide">事业协作</h3>
              <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-3">
                {optimizeScore(result.detailed_scores.career_score)}
                <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">分</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                  style={{width: `${optimizeScore(result.detailed_scores.career_score)}%`}} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg transition-all duration-300 rounded-lg group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                <DollarSign className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-serif font-medium text-slate-700 dark:text-slate-300 mb-3 tracking-wide">财运相合</h3>
              <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-3">
                {optimizeScore(result.detailed_scores.wealth_score)}
                <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">分</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                  style={{width: `${optimizeScore(result.detailed_scores.wealth_score)}%`}} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg transition-all duration-300 rounded-lg group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-300 dark:border-green-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Home className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-serif font-medium text-slate-700 dark:text-slate-300 mb-3 tracking-wide">家庭和睦</h3>
              <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-3">
                {optimizeScore(result.detailed_scores.family_score)}
                <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">分</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                  style={{width: `${optimizeScore(result.detailed_scores.family_score)}%`}} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 雅黑风格关系分析 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
            <CardHeader className="border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800">
              <CardTitle className="text-lg font-serif text-slate-800 dark:text-slate-200 flex items-center justify-center">
                <span className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white mr-3 text-sm">吉</span>
                关系亮点
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {result.analysis.strengths.slice(0, 3).map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-700 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm font-serif text-slate-800 dark:text-slate-200 leading-relaxed">{strength}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
            <CardHeader className="border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800">
              <CardTitle className="text-lg font-serif text-slate-800 dark:text-slate-200 flex items-center justify-center">
                <span className="w-8 h-8 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white mr-3 text-sm">注</span>
                需要关注
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {result.analysis.challenges.slice(0, 3).map((challenge, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-700 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm font-serif text-slate-800 dark:text-slate-200 leading-relaxed">{challenge}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 雅黑风格详细分析 */}
        <Card className="bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
          <CardHeader className="border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif text-slate-800 dark:text-slate-200 flex items-center">
                <span className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-full flex items-center justify-center text-white mr-3 text-sm font-bold">解</span>
                详细分析解读
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/30 font-serif"
              >
                {showDetailedAnalysis ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {showDetailedAnalysis ? '收起' : '展开'}
              </Button>
            </div>
          </CardHeader>
          
          {showDetailedAnalysis && (
            <CardContent className="p-6 space-y-8">
              {/* 相处建议 - 雅黑风格 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                    <span className="text-sm font-bold">策</span>
                  </div>
                  <h4 className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200">相处良策</h4>
                </div>
                <div className="space-y-4">
                  {result.analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm font-serif text-slate-800 dark:text-slate-200 leading-relaxed pt-1">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI深度解读 - 雅黑风格 */}
              {result.ai_analysis && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-full flex items-center justify-center text-white mr-3">
                      <span className="text-sm font-bold">智</span>
                    </div>
                    <h4 className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200">智者解读</h4>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-lg border-2 border-slate-200 dark:border-slate-600 shadow-inner">
                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
                      {(() => {
                        const processedContent = result.ai_analysis
                          .split('\n')
                          .filter(p => p.trim())
                          .filter(p => !p.includes('API_KEY') && !p.includes('function') && !p.includes('return') && !p.includes('总字数') && !p.includes('字数统计'))
                          .map(paragraph => {
                            // 清理多余符号和格式
                            return paragraph
                              .replace(/^#+\s*/, '') // 移除markdown标题符号
                              .replace(/^\d+[\.、]\s*/, '') // 移除数字编号
                              .replace(/[*#]+/g, '') // 移除markdown强调符号
                              .trim()
                          })
                          .filter(p => p.length > 3)
                        
                        return processedContent.map((paragraph, index) => {
                          // 判断是否为标题
                          const isHeading = paragraph.match(/^【.*】$/) || 
                                          paragraph.includes('：') || 
                                          paragraph.match(/^\w+分析/) || 
                                          paragraph.match(/^\w+建议/) ||
                                          paragraph.match(/^性格配对/) ||
                                          paragraph.match(/^感情运势/) ||
                                          paragraph.match(/^事业财运/) ||
                                          paragraph.match(/^婚姻家庭/) ||
                                          paragraph.match(/^改善建议/)
                          
                          if (isHeading) {
                            return (
                              <div key={index} className="mb-4">
                                <h5 className="text-base font-serif font-bold text-slate-700 dark:text-slate-300 mb-2 pb-1 border-b border-slate-200 dark:border-slate-600">
                                  {paragraph}
                                </h5>
                              </div>
                            )
                          } else {
                            return (
                              <p key={index} className="mb-3 last:mb-0 text-slate-700 dark:text-slate-300 leading-relaxed font-serif indent-4">
                                {paragraph}
                              </p>
                            )
                          }
                        })
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}