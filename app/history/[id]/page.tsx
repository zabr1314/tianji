'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Star, 
  StarOff, 
  Share2, 
  RefreshCw, 
  Calendar,
  Sparkles,
  User,
  Heart,
  Brain,
  Moon,
  Users,
  Tag,
  Clock,
  Download,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BaziResult } from '@/components/modules/BaziResult'
import { HepanResult } from '@/components/modules/HepanResult'
import { CompactHepanResult } from '@/components/modules/CompactHepanResult'
import { GenericAnalysisResult } from '@/components/modules/GenericAnalysisResult'

// 分析类型配置
const ANALYSIS_TYPES = {
  bazi: { name: '八字分析', icon: User, color: 'bg-amber-500', path: '/bazi' },
  hepan: { name: '八字合盘', icon: Heart, color: 'bg-rose-500', path: '/hepan' },
  bugua: { name: '日常卜卦', icon: Sparkles, color: 'bg-purple-500', path: '/bugua' },
  calendar: { name: '运势日历', icon: Calendar, color: 'bg-blue-500', path: '/calendar' },
  name: { name: '姓名分析', icon: Users, color: 'bg-green-500', path: '/name' },
  dream: { name: 'AI解梦', icon: Moon, color: 'bg-indigo-500', path: '/dream' }
}

interface AnalysisRecord {
  id: string
  analysis_type: keyof typeof ANALYSIS_TYPES
  title: string
  summary: string
  input_data: any
  output_data: any
  points_cost: number
  is_favorite: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

// 获取质量评分颜色
function getQualityColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400'
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 4) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

// 获取质量评分标签
function getQualityLabel(score: number): string {
  if (score >= 8) return '优秀'
  if (score >= 6) return '良好'
  if (score >= 4) return '一般'
  return '较弱'
}

// 专门为梦境解析渲染完整的宋代美学风格内容
function DreamAnalysisResult({ record }: { record: AnalysisRecord }) {
  const analysis = record.output_data.interpretation_result || {}
  
  // 优先使用AI分析，如果是有效字符串
  let aiContent = ''
  if (typeof record.output_data.ai_analysis === 'string' && record.output_data.ai_analysis.trim()) {
    aiContent = record.output_data.ai_analysis
  } else {
    // 从系统分析重构内容作为备选
    aiContent = `# 梦境深度解析

## 梦境概述
${analysis.dream_summary || '这是一个需要深入解读的梦境。'}

## 心理状态分析
您当前的情绪状态：${analysis.psychological_analysis?.emotional_state || '需要关注内心状态'}

${analysis.psychological_analysis?.subconscious_themes?.length > 0 ? `### 潜意识主题
${analysis.psychological_analysis.subconscious_themes.map((theme: string) => `- ${theme}`).join('\n')}

` : ''}${analysis.life_guidance?.current_situation_insights?.length > 0 ? `## 生活洞察
${analysis.life_guidance.current_situation_insights.map((insight: string) => `- ${insight}`).join('\n')}

` : ''}${analysis.life_guidance?.recommended_actions?.length > 0 ? `## 建议行动
${analysis.life_guidance.recommended_actions.map((action: string) => `- ${action}`).join('\n')}

` : ''}${analysis.warnings_and_suggestions?.health_reminders?.length > 0 ? `## 健康提醒
${analysis.warnings_and_suggestions.health_reminders.map((reminder: string) => `- ${reminder}`).join('\n')}

` : ''}---
*基于系统分析生成的解读内容*`
  }
  
  return (
    <div className="space-y-6">
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
              {record.summary}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* 梦境质量评估 */}
      {analysis.dream_quality && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {Object.entries(analysis.dream_quality).map(([key, score]) => {
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
                  <div className={`text-2xl font-serif font-bold ${getQualityColor(score as number)} drop-shadow-sm`}>
                    {score}/10
                  </div>
                  <div className="text-xs font-serif text-purple-600 dark:text-purple-400">
                    {getQualityLabel(score as number)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 分类和象征分析 */}
      {(analysis.category_analysis || analysis.psychological_analysis) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 梦境分析 */}
          {analysis.category_analysis && (
            <Card className="border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-serif font-bold text-purple-700 dark:text-purple-300">梦境分析</CardTitle>
                <div className="w-12 h-px bg-purple-300 dark:bg-purple-600 mx-auto mt-2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.category_analysis.primary_category && (
                  <div>
                    <div className="font-semibold text-sm mb-2">主要分类</div>
                    <Badge variant="outline" className="mb-2">
                      {analysis.category_analysis.primary_category}
                    </Badge>
                  </div>
                )}
                
                {analysis.category_analysis.secondary_categories?.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2">次要分类</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.category_analysis.secondary_categories.map((category: string, index: number) => (
                        <Badge key={index} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.category_analysis.symbolic_elements?.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2">象征元素</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.category_analysis.symbolic_elements.map((element: string, index: number) => (
                        <Badge key={index} variant="outline">{element}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 心理状态 */}
          {analysis.psychological_analysis && (
            <Card className="border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-serif font-bold text-purple-700 dark:text-purple-300">心理状态</CardTitle>
                <div className="w-12 h-px bg-purple-300 dark:bg-purple-600 mx-auto mt-2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.psychological_analysis.emotional_state && (
                  <div>
                    <div className="font-semibold text-sm mb-2">情绪状态</div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.psychological_analysis.emotional_state}
                    </p>
                  </div>
                )}
                
                {analysis.psychological_analysis.subconscious_themes?.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2">潜意识主题</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.psychological_analysis.subconscious_themes.map((theme: string, index: number) => (
                        <Badge key={index} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.psychological_analysis.stress_indicators?.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2">压力指标</div>
                    <ul className="space-y-1">
                      {analysis.psychological_analysis.stress_indicators.map((indicator: string, index: number) => (
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
          )}
        </div>
      )}

      {/* 象征解释 */}
      {analysis.symbolic_interpretation?.key_symbols?.length > 0 && (
        <Card className="mb-8 border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-serif font-bold text-purple-700 dark:text-purple-300">象征符号解读</CardTitle>
            <div className="w-16 h-px bg-purple-300 dark:bg-purple-600 mx-auto mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.symbolic_interpretation.key_symbols.map((symbol: any, index: number) => (
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
      {analysis.life_guidance && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-teal-600">生活洞察</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.life_guidance.current_situation_insights?.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-2">当前状况</div>
                  <ul className="space-y-1">
                    {analysis.life_guidance.current_situation_insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.life_guidance.emotional_needs?.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-2">情感需求</div>
                  <ul className="space-y-1">
                    {analysis.life_guidance.emotional_needs.map((need: string, index: number) => (
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
              {analysis.life_guidance.growth_opportunities?.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-2">成长机会</div>
                  <ul className="space-y-1">
                    {analysis.life_guidance.growth_opportunities.map((opportunity: string, index: number) => (
                      <li key={index} className="flex items-center text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-2" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.life_guidance.recommended_actions?.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-2">建议行动</div>
                  <ul className="space-y-1">
                    {analysis.life_guidance.recommended_actions.map((action: string, index: number) => (
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
      )}

      {/* 警示和建议 */}
      {analysis.warnings_and_suggestions && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {analysis.warnings_and_suggestions.health_reminders?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">健康提醒</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.warnings_and_suggestions.health_reminders.map((reminder: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <AlertCircle className="w-3 h-3 text-red-500 mr-2" />
                      {reminder}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.warnings_and_suggestions.spiritual_messages?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">精神启示</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.warnings_and_suggestions.spiritual_messages.map((message: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <Star className="w-3 h-3 text-blue-500 mr-2" />
                      {message}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AI深度解读 - 宋代美学风格，与解梦页面完全一致 */}
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
              <ReactMarkdown
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
                    const isOrdered = props.ordered;
                    return (
                      <li className={`${isOrdered ? 'list-decimal' : 'list-disc'} list-inside text-slate-700 dark:text-slate-300 leading-relaxed pl-2`}>
                        <span className="ml-2 font-serif">{children}</span>
                      </li>
                    )
                  },
                  // 代码
                  code: ({children, inline}) => {
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
                {aiContent || '暂无AI解读内容'}
              </ReactMarkdown>
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
    </div>
  )
}

export default function RecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<AnalysisRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadRecord(params.id as string)
    }
  }, [params.id])

  const loadRecord = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/history/records/${id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setRecord(data.data)
      } else {
        setError(data.error || '记录不存在')
      }
    } catch (error) {
      console.error('Failed to load record:', error)
      setError('加载记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!record) return
    
    try {
      const response = await fetch(`/api/history/records/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_favorite: !record.is_favorite
        })
      })

      const data = await response.json()

      if (data.success) {
        setRecord(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null)
      } else {
        console.error('Failed to toggle favorite:', data.error)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleReanalyze = () => {
    if (!record) return
    
    // 跳转到对应的分析页面，并预填数据
    const typeConfig = ANALYSIS_TYPES[record.analysis_type]
    const queryParams = new URLSearchParams({
      reanalyze: 'true',
      data: JSON.stringify(record.input_data)
    })
    
    router.push(`${typeConfig.path}?${queryParams.toString()}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 保存报告为PDF
  const handleSaveReport = async () => {
    if (!record) return
    
    setIsSaving(true)
    try {
      // 生成报告内容
      const reportContent = generateReportContent(record)
      
      // 创建并下载文件
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${record.title}_${new Date().toLocaleDateString()}.txt`
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

  // 分享结果
  const handleShare = async () => {
    if (!record) return

    setIsSharing(true)
    try {
      const shareText = `🔮 我在天机AI完成了${ANALYSIS_TYPES[record.analysis_type].name}！

📊 分析结果：${record.summary}
⭐ 来体验专业的命理分析吧！

#天机AI #${ANALYSIS_TYPES[record.analysis_type].name} #命理分析`

      if (navigator.share) {
        await navigator.share({
          title: `天机AI - ${record.title}`,
          text: shareText,
          url: window.location.href
        })
      } else {
        // 降级方案：复制到剪贴板
        await navigator.clipboard.writeText(shareText + `\n\n查看详情：${window.location.href}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('分享失败:', error)
      // 降级方案：手动复制
      try {
        const shareText = `天机AI - ${record.title}\n\n${record.summary}\n\n查看详情：${window.location.href}`
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

  // 生成报告内容
  const generateReportContent = (record: AnalysisRecord): string => {
    const date = new Date().toLocaleDateString('zh-CN')
    let content = `
==============================
天机AI - ${ANALYSIS_TYPES[record.analysis_type].name}报告
分析标题：${record.title}
生成时间：${date}
==============================

【分析摘要】
${record.summary}

`

    // 根据分析类型添加特定内容
    if (record.analysis_type === 'bazi' && record.output_data.bazi) {
      content += `【八字四柱】
年柱：${record.output_data.bazi.year_ganzhi || '未知'}
月柱：${record.output_data.bazi.month_ganzhi || '未知'}  
日柱：${record.output_data.bazi.day_ganzhi || '未知'} [日主]
时柱：${record.output_data.bazi.hour_ganzhi || '未知'}

【五行分析】
木：${record.output_data.wuxing_analysis?.wood || 0}个
火：${record.output_data.wuxing_analysis?.fire || 0}个
土：${record.output_data.wuxing_analysis?.earth || 0}个
金：${record.output_data.wuxing_analysis?.metal || 0}个
水：${record.output_data.wuxing_analysis?.water || 0}个

最强五行：${record.output_data.wuxing_analysis?.strongest || '未知'}
最弱五行：${record.output_data.wuxing_analysis?.weakest || '未知'}
用神：${record.output_data.yongshen || '未知'}

`
    }

    // 添加AI分析内容
    if (record.output_data.ai_analysis) {
      content += `【AI智能分析】
${record.output_data.ai_analysis}

`
    } else if (record.output_data.result) {
      content += `【分析结果】
${record.output_data.result}

`
    }

    content += `==============================
本次分析消耗：${record.points_cost} 天机点
报告由天机AI生成 - 仅供参考
==============================`

    return content
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-serif">加载记录详情...</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
            记录不存在
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-serif mb-6">
            {error || '未找到指定的分析记录'}
          </p>
          <Link href="/history">
            <Button className="font-serif">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回历史记录
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = ANALYSIS_TYPES[record.analysis_type]

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
          {/* 页面操作栏 */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="font-serif">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回历史记录
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="text-amber-600 hover:text-amber-700"
              >
                {record.is_favorite ? (
                  <Star className="h-4 w-4 fill-current mr-2" />
                ) : (
                  <StarOff className="h-4 w-4 mr-2" />
                )}
                {record.is_favorite ? '已收藏' : '收藏'}
              </Button>
              <Button variant="outline" size="sm" className="font-serif">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
          {/* 记录头部信息 */}
          <section className="mb-8">
            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${typeConfig.color} rounded-xl flex items-center justify-center`}>
                      {(() => {
                        const IconComponent = typeConfig.icon;
                        return <IconComponent className="h-8 w-8 text-white" />;
                      })()}
                    </div>
                    <div>
                      <Badge className="mb-2 font-serif">
                        {typeConfig.name}
                      </Badge>
                      <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {record.title}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-serif">{formatDate(record.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-serif">{record.points_cost} 天机点</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleReanalyze} className="font-serif">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新分析
                  </Button>
                </div>

                {/* 标签 */}
                {record.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-6">
                    <Tag className="h-4 w-4 text-slate-500" />
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="font-serif">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 分析摘要 */}
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                  <h3 className="text-lg font-serif font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    分析摘要
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                    {record.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 分析结果显示 */}
          <section className="space-y-6">
            {/* 根据分析类型显示完整的分析结果 */}
            {record.analysis_type === 'bazi' && record.output_data.bazi && record.output_data.wuxing_analysis ? (
              <div className="bg-teal-50/50 dark:bg-teal-800/50 rounded-lg p-6 border border-teal-200 dark:border-teal-700">
                <BaziResult 
                  bazi={record.output_data.bazi}
                  wuxingAnalysis={record.output_data.wuxing_analysis}
                  dayun={record.output_data.dayun || []}
                  yongshen={record.output_data.yongshen || '未知'}
                  aiAnalysis={record.output_data.ai_analysis || ''}
                  cost={record.points_cost}
                />
              </div>
            ) : record.analysis_type === 'hepan' && (record.output_data.compatibility || record.output_data.person1) ? (
              <div className="bg-rose-50/50 dark:bg-rose-800/50 rounded-lg p-6 border border-rose-200 dark:border-rose-700">
                <CompactHepanResult result={record.output_data} />
              </div>
            ) : record.analysis_type === 'dream' ? (
              /* 梦境解析使用专门的宋代美学风格显示 */
              <DreamAnalysisResult record={record} />
            ) : (
              <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <GenericAnalysisResult 
                  title={record.title}
                  analysisType={record.analysis_type}
                  aiAnalysis={record.output_data.ai_analysis}
                  result={record.output_data.result}
                  cost={record.points_cost}
                  additionalData={record.output_data}
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="mt-8 text-center space-x-4">
              <Button 
                onClick={handleReanalyze}
                className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-serif"
              >
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
                onClick={handleShare}
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
          </section>
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