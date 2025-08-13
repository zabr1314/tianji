'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Users, Star, TrendingUp } from 'lucide-react'

// 简单的进度条组件
function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${className}`}>
      <div 
        className="bg-slate-600 dark:bg-slate-400 h-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

interface HepanResultData {
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
}

interface HepanResultProps {
  result: HepanResultData
}

export function HepanResult({ result }: HepanResultProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreLevel = (score: number): string => {
    if (score >= 80) return '极佳'
    if (score >= 60) return '良好'
    if (score >= 40) return '一般'
    return '待改善'
  }

  return (
    <div className="space-y-6">
      {/* 综合评分 */}
      <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
            综合匹配度
          </CardTitle>
          <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-6"></div>
          <div className="text-6xl font-serif font-bold mt-4">
            <span className={`${getScoreColor(result.compatibility.overall_score)} drop-shadow-sm`}>
              {result.compatibility.overall_score}
            </span>
            <span className="text-2xl text-slate-500 dark:text-slate-400 ml-2">分</span>
          </div>
          <Badge variant="outline" className="mt-4 text-sm font-serif px-4 py-2 border-slate-300 dark:border-slate-600">
            {getScoreLevel(result.compatibility.overall_score)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-600 dark:text-slate-400 font-serif">
            基于传统八字合盘理论，结合现代AI分析算法综合评定
          </div>
        </CardContent>
      </Card>

      {/* 详细分析维度 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 匹配度分析 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-slate-600" />
              匹配度分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">五行匹配</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.wuxing_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.wuxing_compatibility} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">干支匹配</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.ganzhi_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.ganzhi_compatibility} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">用神匹配</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.yongshen_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.yongshen_compatibility} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">大运匹配</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.dayun_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.dayun_compatibility} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 生活领域评分 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-slate-600" />
              生活领域评分
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">感情匹配</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.love_score}分</span>
              </div>
              <Progress value={result.detailed_scores.love_score} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">事业协作</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.career_score}分</span>
              </div>
              <Progress value={result.detailed_scores.career_score} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">财运相合</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.wealth_score}分</span>
              </div>
              <Progress value={result.detailed_scores.wealth_score} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">健康互补</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.health_score}分</span>
              </div>
              <Progress value={result.detailed_scores.health_score} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">家庭和谐</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.family_score}分</span>
              </div>
              <Progress value={result.detailed_scores.family_score} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 优势与挑战 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* 关系优势 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Star className="h-4 w-4 mr-2 text-green-600" />
              关系优势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                    {strength}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 潜在挑战 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Users className="h-4 w-4 mr-2 text-orange-600" />
              潜在挑战
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.analysis.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                    {challenge}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 改善建议 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-blue-600" />
              改善建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI分析结果 */}
      {result.ai_analysis && (
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-serif font-bold text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">智</span>
              </div>
              <div>AI智能分析</div>
            </CardTitle>
            <div className="text-center">
              <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {result.ai_analysis.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-sm leading-relaxed mb-4 text-slate-700 dark:text-slate-300 font-serif">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 消费信息 */}
      <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3 text-slate-700 dark:text-slate-300">
            <div className="w-6 h-6 bg-slate-700 dark:bg-slate-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">点</span>
            </div>
            <span className="text-sm font-medium">本次分析消费了</span>
            <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white border-0 font-medium px-3 py-1">
              {result.cost} 天机点
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}