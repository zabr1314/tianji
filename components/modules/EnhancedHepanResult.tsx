'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  Users, 
  Star, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Lightbulb,
  Zap,
  Shield,
  Baby,
  Gem,
  Sun,
  Moon,
  TreePine
} from 'lucide-react'

interface EnhancedHepanResultData {
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
}

interface EnhancedHepanResultProps {
  result: EnhancedHepanResultData
}

export function EnhancedHepanResult({ result }: EnhancedHepanResultProps) {
  // 获取关系类型定位
  const getRelationshipType = (score: number): { label: string, color: string, icon: string } => {
    if (score >= 85) return { label: '灵魂共鸣型', color: 'text-purple-600', icon: '✨' }
    if (score >= 75) return { label: '互助成长型', color: 'text-blue-600', icon: '🌱' }
    if (score >= 65) return { label: '现实搭档型', color: 'text-green-600', icon: '🤝' }
    if (score >= 50) return { label: '磨合考验型', color: 'text-orange-600', icon: '⚡' }
    return { label: '挑战成长型', color: 'text-red-600', icon: '🔥' }
  }

  // 获取分数颜色
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  // 获取分数等级
  const getScoreLevel = (score: number): string => {
    if (score >= 85) return '极佳'
    if (score >= 75) return '优秀'
    if (score >= 65) return '良好'
    if (score >= 50) return '中等'
    if (score >= 35) return '待改善'
    return '需关注'
  }

  // 渲染八字命盘柱
  const renderBaziPillar = (title: string, ganzhi: string, isImportant = false) => {
    const [tiangan, dizhi] = ganzhi.split('')
    return (
      <div className={`text-center p-3 rounded-lg ${isImportant ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800'}`}>
        {isImportant && (
          <Badge className="mb-2 bg-amber-600 text-white text-xs">
            核心宫位
          </Badge>
        )}
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{title}</div>
        <div className="space-y-1">
          <div className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">{tiangan}</div>
          <div className="w-6 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
          <div className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">{dizhi}</div>
        </div>
      </div>
    )
  }

  const relationshipType = getRelationshipType(result.compatibility.overall_score)

  return (
    <div className="space-y-8">
      {/* 一、双方命盘并列呈现 */}
      <Card className="shadow-lg border-2 border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300">
            八字合盘分析
          </CardTitle>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200 px-4 py-2">
              {result.person1.name}
            </Badge>
            <Heart className="h-5 w-5 text-rose-500" />
            <Badge variant="outline" className="text-pink-600 border-pink-200 px-4 py-2">
              {result.person2.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 左侧：第一人命盘 */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-serif font-bold text-blue-600 mb-4">
                  {result.person1.name} 的命盘
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {renderBaziPillar('年柱', result.person1.bazi.year_ganzhi)}
                  {renderBaziPillar('月柱', result.person1.bazi.month_ganzhi)}
                  {renderBaziPillar('日柱', result.person1.bazi.day_ganzhi, true)}
                  {renderBaziPillar('时柱', result.person1.bazi.hour_ganzhi)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">五行属性</div>
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                  主五行：{result.person1.wuxing_analysis.strongest}
                </Badge>
              </div>
            </div>

            {/* 右侧：第二人命盘 */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-serif font-bold text-pink-600 mb-4">
                  {result.person2.name} 的命盘
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {renderBaziPillar('年柱', result.person2.bazi.year_ganzhi)}
                  {renderBaziPillar('月柱', result.person2.bazi.month_ganzhi)}
                  {renderBaziPillar('日柱', result.person2.bazi.day_ganzhi, true)}
                  {renderBaziPillar('时柱', result.person2.bazi.hour_ganzhi)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">五行属性</div>
                <Badge className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700">
                  主五行：{result.person2.wuxing_analysis.strongest}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 二、匹配度总览 */}
      <Card className="shadow-lg border-2 border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
            综合匹配度分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 总分展示 */}
            <div className="text-center">
              <div className="text-6xl font-serif font-bold mb-2">
                <span className={`${getScoreColor(result.compatibility.overall_score)} drop-shadow-sm`}>
                  {result.compatibility.overall_score}
                </span>
                <span className="text-2xl text-slate-500 dark:text-slate-400 ml-2">分</span>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                {getScoreLevel(result.compatibility.overall_score)}
              </Badge>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <span className="text-2xl">{relationshipType.icon}</span>
                <span className={`text-sm font-medium ${relationshipType.color}`}>
                  {relationshipType.label}
                </span>
              </div>
            </div>

            {/* 主要优势 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">主要优势</h4>
              </div>
              {result.analysis.strengths.slice(0, 3).map((strength, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                    {strength}
                  </p>
                </div>
              ))}
            </div>

            {/* 需要关注 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">需要关注</h4>
              </div>
              {result.analysis.challenges.slice(0, 3).map((challenge, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                    {challenge}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 三、深度分析模块 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 命理匹配度分析 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-slate-600" />
              命理匹配度分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 日主匹配度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">日主相配度</span>
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {Math.round((result.compatibility.ganzhi_compatibility + result.compatibility.yongshen_compatibility) / 2)}分
                </span>
              </div>
              <Progress value={Math.round((result.compatibility.ganzhi_compatibility + result.compatibility.yongshen_compatibility) / 2)} className="h-3" />
            </div>

            {/* 五行互补性 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">五行互补度</span>
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.wuxing_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.wuxing_compatibility} className="h-3" />
            </div>

            {/* 夫妻宫分析 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">夫妻宫和合</span>
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.ganzhi_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.ganzhi_compatibility} className="h-3" />
            </div>

            {/* 大运同步性 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">大运同步性</span>
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.compatibility.dayun_compatibility}分</span>
              </div>
              <Progress value={result.compatibility.dayun_compatibility} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* 生活领域评分 */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Users className="h-5 w-5 mr-2 text-slate-600" />
              生活领域评分
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 感情和谐度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">感情和谐度</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.love_score}分</span>
              </div>
              <Progress value={result.detailed_scores.love_score} className="h-3" />
            </div>

            {/* 事业协作度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">事业协作度</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.career_score}分</span>
              </div>
              <Progress value={result.detailed_scores.career_score} className="h-3" />
            </div>

            {/* 财运相合度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">财运相合度</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.wealth_score}分</span>
              </div>
              <Progress value={result.detailed_scores.wealth_score} className="h-3" />
            </div>

            {/* 健康互补度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">健康互补度</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.health_score}分</span>
              </div>
              <Progress value={result.detailed_scores.health_score} className="h-3" />
            </div>

            {/* 家庭和睦度 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">家庭和睦度</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.detailed_scores.family_score}分</span>
              </div>
              <Progress value={result.detailed_scores.family_score} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 四、实用建议模块 */}
      <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
            相处锦囊 - 让关系更美好
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {result.analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                      {suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 五、AI智能分析 */}
      {result.ai_analysis && (
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-serif font-bold text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">智</span>
              </div>
              <div>AI深度解读</div>
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
            <span className="text-sm font-medium font-serif">本次合盘分析消费了</span>
            <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white border-0 font-medium px-3 py-1 font-serif">
              {result.cost} 天机点
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}