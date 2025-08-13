'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

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
  // 优化评分算法，让分数稍微高一点
  const optimizeScore = (originalScore: number): number => {
    const adjusted = Math.min(95, Math.round(originalScore * 1.15 + 8))
    return adjusted
  }

  // 获取关系类型配置
  const getRelationshipConfig = (score: number, type?: string) => {
    const configs = {
      couple: {
        colors: ['text-pink-600', 'bg-pink-50', 'border-pink-200'],
        labels: score >= 85 ? '天作之合' : score >= 75 ? '佳偶天成' : score >= 65 ? '相濡以沫' : score >= 50 ? '磨合成长' : '需要努力',
        icon: '💕'
      },
      friends: {
        colors: ['text-blue-600', 'bg-blue-50', 'border-blue-200'],
        labels: score >= 85 ? '知音难觅' : score >= 75 ? '志同道合' : score >= 65 ? '相处融洽' : score >= 50 ? '友情可期' : '需要磨合',
        icon: '🤝'
      },
      colleagues: {
        colors: ['text-green-600', 'bg-green-50', 'border-green-200'], 
        labels: score >= 85 ? '黄金搭档' : score >= 75 ? '合作无间' : score >= 65 ? '配合默契' : score >= 50 ? '互补共赢' : '需要协调',
        icon: '💼'
      },
      family: {
        colors: ['text-amber-600', 'bg-amber-50', 'border-amber-200'],
        labels: score >= 85 ? '血浓于水' : score >= 75 ? '家和万事兴' : score >= 65 ? '亲情深厚' : score >= 50 ? '家庭和睦' : '需要包容',
        icon: '🏠'
      }
    }
    
    const key = (type as keyof typeof configs) || 'couple'
    return configs[key] || configs.couple
  }

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
    <div className="bg-gradient-to-br from-amber-50 via-slate-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen -m-4 p-6">
      {/* 古典装饰背景 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-16 left-16 w-32 h-32 border-2 border-amber-300 dark:border-amber-700 rounded-full opacity-20"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border border-slate-400 dark:border-slate-600 rounded-full opacity-30"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-amber-400 dark:bg-amber-600 rounded-full opacity-40"></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* 合盘匹配度总览 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 dark:border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 border-4 border-amber-300 dark:border-amber-600 mb-6 shadow-lg">
              <div>
                <div className="text-4xl font-bold text-amber-700 dark:text-amber-400 font-serif">{optimizeScore(result.compatibility.overall_score)}</div>
                <div className="text-sm text-amber-600 dark:text-amber-400 font-medium font-serif">综合匹配</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 font-serif">{relationConfig.icon} {relationConfig.labels}</h2>
            <p className="text-slate-600 dark:text-slate-400 font-serif">{result.person1.name} & {result.person2.name} 的缘分解析</p>
          </div>

          {/* 合盘详细评分 */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 font-serif border-b border-amber-200 dark:border-slate-600 pb-2">合盘匹配度</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">五行相合</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${optimizeScore(result.compatibility.wuxing_compatibility)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 w-12 font-serif">{optimizeScore(result.compatibility.wuxing_compatibility)}分</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">干支相合</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${optimizeScore(result.compatibility.ganzhi_compatibility)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 w-12 font-serif">{optimizeScore(result.compatibility.ganzhi_compatibility)}分</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">用神相配</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${optimizeScore(result.compatibility.yongshen_compatibility)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 w-12 font-serif">{optimizeScore(result.compatibility.yongshen_compatibility)}分</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">大运同步</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: `${optimizeScore(result.compatibility.dayun_compatibility)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 w-12 font-serif">{dayunSync.score}分</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 font-serif border-b border-amber-200 dark:border-slate-600 pb-2">生活领域评分</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">💕 感情和谐</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: `${optimizeScore(result.detailed_scores.love_score)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400 w-12 font-serif">{optimizeScore(result.detailed_scores.love_score)}分</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">💼 事业协作</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${optimizeScore(result.detailed_scores.career_score)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 w-12 font-serif">{optimizeScore(result.detailed_scores.career_score)}分</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">💰 财运相合</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${optimizeScore(result.detailed_scores.wealth_score)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 w-12 font-serif">{optimizeScore(result.detailed_scores.wealth_score)}分</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-amber-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-serif">👨‍👩‍👧‍👦 家庭和睦</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${optimizeScore(result.detailed_scores.family_score)}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 w-12 font-serif">{optimizeScore(result.detailed_scores.family_score)}分</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 合盘关系分析 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 dark:border-slate-700 p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-8 text-center font-serif">⚡ 合盘关系分析</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 十神关系 */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 font-serif">🔮 十神关系</h4>
              <div className="space-y-3">
                {tianshenRelations.map((relation, index) => (
                  <div key={index} className="bg-amber-50 dark:bg-slate-700 p-4 rounded-xl border border-amber-200 dark:border-slate-600 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-serif">{relation.name}</span>
                      <span className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full font-serif">相合</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-serif leading-relaxed">{relation.compatibility}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 大运同步性 */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 font-serif">🌟 大运同步性</h4>
              <div className="bg-amber-50 dark:bg-slate-700 p-4 rounded-xl border border-amber-200 dark:border-slate-600 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-serif">同步等级</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 font-serif">{dayunSync.level}</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400 font-serif">同步评分</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-serif">{dayunSync.score}分</span>
                  </div>
                  <div className="w-full bg-amber-200 dark:bg-slate-600 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${dayunSync.score}%`}}></div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif leading-relaxed">{dayunSync.description}</p>
              </div>
            </div>

            {/* 子女缘分 */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 font-serif">👶 子女缘分</h4>
              <div className="bg-amber-50 dark:bg-slate-700 p-4 rounded-xl border border-amber-200 dark:border-slate-600 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-serif">子女运势</span>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 font-serif">{childrenFate.childrenLuck}分</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-serif">教育观念</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 font-serif">{childrenFate.educationHarmony}分</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-serif">家庭氛围</span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-serif">{childrenFate.familyAtmosphere}分</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-serif">综合评分</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-serif">{childrenFate.overall}分</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-serif leading-relaxed">{childrenFate.analysis}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 关系建议 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center font-serif">✨ 关系发展建议</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-semibold text-green-600 dark:text-green-400 mb-3 font-serif">💪 关系优势</h4>
              <div className="space-y-2">
                {result.analysis.strengths.slice(0, 2).map((strength, index) => (
                  <div key={index} className="flex items-start space-x-2 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-orange-600 dark:text-orange-400 mb-3 font-serif">⚠️ 需要关注</h4>
              <div className="space-y-2">
                {result.analysis.challenges.slice(0, 2).map((challenge, index) => (
                  <div key={index} className="flex items-start space-x-2 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-base font-semibold text-blue-600 dark:text-blue-400 mb-3 font-serif">💡 实用建议</h4>
            <div className="grid gap-2">
              {result.analysis.suggestions.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 font-serif">
                    {index + 1}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI深度分析区域 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 dark:border-slate-700 p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold font-serif">AI</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-serif">深度分析解读</h2>
            </div>
            <div className="w-16 h-px bg-amber-300 dark:bg-amber-600 mx-auto mt-2"></div>
          </div>
          <div className="bg-amber-50 dark:bg-slate-700 rounded-xl p-6 border border-amber-200 dark:border-slate-600 shadow-inner">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {result.ai_analysis && result.ai_analysis.trim() ? (
                (() => {
                  const processedContent = result.ai_analysis
                    .split('\n')
                    .filter(p => p.trim())
                    .filter(p => !p.includes('API_KEY') && !p.includes('function') && !p.includes('return') && !p.includes('总字数') && !p.includes('字数统计'))
                    .map(paragraph => {
                      if (paragraph.includes('##') || paragraph.match(/^【.*】$/) || paragraph.match(/^\d+[\.、]/) || paragraph.includes('：')) {
                        return paragraph.replace(/^#+\s*/, '').replace(/^\d+[\.、]\s*/, '').trim()
                      }
                      return paragraph.replace(/[*#]+/g, '').trim()
                    })
                    .filter(p => p.length > 3)
                  
                  console.log('AI Analysis Content:', processedContent)
                  
                  if (processedContent.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <p className="text-slate-500 dark:text-slate-400 font-serif text-sm">
                          原始内容：{result.ai_analysis.substring(0, 200)}...
                        </p>
                      </div>
                    )
                  }
                  
                  return processedContent.map((paragraph, index) => {
                    const isHeading = paragraph.match(/^【.*】$/) || paragraph.includes('：') || paragraph.match(/^\w+分析/) || paragraph.match(/^\w+建议/)
                    
                    return (
                      <div key={index} className="mb-3 last:mb-0">
                        {isHeading ? (
                          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 font-serif">
                            {paragraph}
                          </h4>
                        ) : (
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm font-serif">
                            {paragraph}
                          </p>
                        )}
                      </div>
                    )
                  })
                })()
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 dark:text-slate-400 font-serif text-sm">
                    {result.ai_analysis ? '内容处理中...' : 'AI正在为您生成深度分析解读...'}
                  </p>
                  {result.ai_analysis && (
                    <p className="text-xs text-slate-400 mt-2">
                      调试信息: {typeof result.ai_analysis} - 长度: {result.ai_analysis.length}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}